import {
  aws_cloudfront as cloudfront,
  aws_cloudwatch as cloudwatch,
  aws_route53 as route53,
  aws_route53_targets as targets,
  aws_s3 as s3,
  CfnOutput,
  Stack,
} from 'aws-cdk-lib'
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import { Node } from 'constructs'

interface SetupCloudfrontProps {
  node: Node,
  certificateArn: string,
  siteDomain: string,
  siteBucket: s3.IBucket,
  cloudfrontOAI: cloudfront.OriginAccessIdentity
  zone: route53.IHostedZone
}

export const setupCloudfront = (
  stack: Stack,
  id: string,
  {
    node,
    certificateArn,
    siteDomain,
    siteBucket,
    cloudfrontOAI,
    zone,
  }: SetupCloudfrontProps
): cloudfront.CloudFrontWebDistribution => {

  // Specifies you want viewers to use HTTPS & TLS v1.1 to request your objects
  const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate({
    certificateArn,
    env: {
      region: process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT,
    },
    node,
    stack,
    metricDaysToExpiry: () =>
      new cloudwatch.Metric({
        namespace: "TLS Viewer Certificate Validity",
        metricName: "TLS Viewer Certificate Expired",
      }),
  } as ICertificate,
  {
    sslMethod: cloudfront.SSLMethod.SNI,
    securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
    aliases: [siteDomain]
  })
  
  // CloudFront distribution
  const distribution = new cloudfront.CloudFrontWebDistribution(stack, id, {
    viewerCertificate,
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource: siteBucket,
          originAccessIdentity: cloudfrontOAI
        },
        behaviors: [{
          isDefaultBehavior: true,
          compress: true,
          allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
        }],
      }
    ]
  })

  new CfnOutput(stack, 'CloudFrontDistributionId', { value: distribution.distributionId })

  // Route53 alias record for the CloudFront distribution
  new route53.ARecord(stack, 'SiteAliasRecord', {
    recordName: siteDomain,
    target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    zone
  })

  return distribution
}