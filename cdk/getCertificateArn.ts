import { aws_certificatemanager as acm, Stack } from 'aws-cdk-lib'
import { IHostedZone } from 'aws-cdk-lib/aws-route53'

interface GetCertificateArnProps {
  siteDomain: string,
  hostedZone: IHostedZone,
}

export const getCertificateArn = (
  stack: Stack,
  id: string,
  {
    siteDomain,
    hostedZone,
  }: GetCertificateArnProps  
): string => new acm.DnsValidatedCertificate(stack, id, {
  domainName: siteDomain,
  hostedZone,
  region: 'us-east-1', // Cloudfront only checks this region for certificates.
}).certificateArn