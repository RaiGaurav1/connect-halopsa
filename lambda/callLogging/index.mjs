// Using ES modules (Node.js 20)
import AWSXRay from 'aws-xray-sdk-core';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ConnectClient, StartOutboundVoiceContactCommand } from '@aws-sdk/client-connect';
import https from 'https';

// Import from layer
import HaloPSAClient from '/opt/nodejs/halopsa-client.js';

const secretsClient    = new SecretsManagerClient({});
const cloudwatchClient = new CloudWatchClient({});
const ddbClient        = new DynamoDBClient({});
const docClient        = DynamoDBDocumentClient.from(ddbClient);
const connectClient    = new ConnectClient({});

const {
  CALL_LOGS_TABLE_NAME,
  HALO_SECRET_NAME
} = process.env;

async function getSecrets() {
  const resp = await secretsClient.send(new GetSecretValueCommand({ SecretId: HALO_SECRET_NAME }));
  return JSON.parse(resp.SecretString);
}

// Using proper ES module export syntax
export const handler = async (event, context) => {
  return AWSXRay.captureAsyncFunc('CallLoggingHandler', async () => {
    const startTime = Date.now();
    let metric = { success: false };

    try {
      // Extract call attributes from Connect event payload
      const { customerId, phoneNumber, agentId, contactId, startTimestamp, endTimestamp, transcript } = parseEvent(event);

      if (!customerId || !phoneNumber || !agentId) {
        console.warn('Missing required data for CallLogging:', { customerId, phoneNumber, agentId });
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing required data' }) };
      }

      // 1. Retrieve HaloPSA secrets & initialize client
      const secrets = await getSecrets();
      const haloClient = new HaloPSAClient({
        baseURL:    secrets.apiBaseUrl,
        clientId:   secrets.clientId,
        clientSecret: secrets.clientSecret,
        tenantId:   secrets.tenantId
      });

      // 2. Create call log in HaloPSA
      const callData = {
        phoneNumber,
        transcript,
        customerId,
        agentId,
        startTime: startTimestamp,
        endTime: endTimestamp
      };
      const ticket = await haloClient.createCallLog(callData);

      // 3. Write to CallLogsTable for auditing
      await docClient.send(new PutCommand({
        TableName: CALL_LOGS_TABLE_NAME,
        Item: {
          contactId,
          timestamp: startTimestamp,
          ticketId: ticket.id,
          phoneNumber,
          agentId,
          createdAt: new Date().toISOString()
        }
      }));

      metric.success = true;
      await publishMetrics(metric, Date.now() - startTime);
      return { statusCode: 200, body: JSON.stringify({ ticketId: ticket.id }) };
    } catch (err) {
      console.error('Error in CallLogging:', err);
      await publishMetrics(metric, Date.now() - startTime);
      return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
    }
  })();
};

function parseEvent(event) {
  // This depends on how Connect invokes the Lambda: if via "Invoke AWS Lambda" block
  const attrs = event.Details?.ContactData?.Attributes || {};
  return {
    customerId:     attrs.CustomerId,
    phoneNumber:    attrs.PhoneNumber,
    agentId:        attrs.AgentId,
    contactId:      event.Details?.ContactData?.ContactId,
    startTimestamp: attrs.StartTimestamp,
    endTimestamp:   attrs.EndTimestamp,
    transcript:     attrs.Transcript
  };
}

async function publishMetrics(metrics, duration) {
  try {
    await cloudwatchClient.send(new PutMetricDataCommand({
      Namespace: 'ConnectHaloPSA',
      MetricData: [
        { MetricName: 'CallLoggingDuration', Value: duration, Unit: 'Milliseconds', Timestamp: new Date() },
        { MetricName: 'CallLoggingSuccess',  Value: metrics.success ? 1 : 0, Unit: 'Count', Timestamp: new Date() }
      ]
    }));
  } catch (err) {
    console.warn('Failed to publish metrics:', err);
  }
}
