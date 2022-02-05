import {
  aws_cloudfront as cloudfront,
  aws_route53 as route53,
  aws_s3_deployment as s3deploy,
  CfnOutput,
  Stack,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { createSiteBucket } from './bucket'
import { getCertificateArn } from './getCertificateArn'
import { setupCloudfront } from './setupCloudfront'

export interface StaticSiteProps {
  domainName: string
  siteSubDomain: string
  websitePath: string
  websiteIndexDocument: string,
  websiteErrorDocument: string,
}
export class StaticSite extends Construct {
  constructor(
    stack: Stack,
    name: string,
    {
      domainName,
      siteSubDomain,
      websitePath,
      websiteIndexDocument,
      websiteErrorDocument,
    }: StaticSiteProps
  ) {
    super(stack, name)
    
    const node = this.node
    const siteDomain = `${siteSubDomain}.${domainName}`
    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName })
    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
      comment: `OAI for ${name}`
    })

    new CfnOutput(this, 'Site', { value: 'https://' + siteDomain })

    const siteBucket = createSiteBucket(stack, 'SiteBucket', {
      bucketName: siteDomain,
      cloudfrontOAI,
      websiteIndexDocument,
      websiteErrorDocument
    })

    const certificateArn = getCertificateArn(stack, 'SiteCertificate', {
      siteDomain,
      hostedZone: zone
    })

    const distribution = setupCloudfront(stack, 'SiteDistribution', {
      node,
      certificateArn,
      siteDomain,
      siteBucket,
      cloudfrontOAI,
      zone
    })

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset(websitePath)],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    })
  }
}
