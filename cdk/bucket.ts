import {
  aws_iam as iam,
  aws_s3 as s3,
  CfnOutput,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib'
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront'

interface CreateSiteBucketProps {
  bucketName: string,
  cloudfrontOAI: OriginAccessIdentity
  websiteIndexDocument: string,
  websiteErrorDocument: string,
}

export const createSiteBucket = (
  stack: Stack,
  id: string,
  {
    bucketName,
    cloudfrontOAI,
    websiteIndexDocument,
    websiteErrorDocument,
  }: CreateSiteBucketProps
): s3.IBucket => {

  const siteBucket = new s3.Bucket(stack, id, {
    bucketName,
    websiteIndexDocument,
    websiteErrorDocument,
    publicReadAccess: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: RemovalPolicy.DESTROY, // When stack is deleted, so to is the bucket
    autoDeleteObjects: true, // When stack is deleted, all objects in bucket are also deleted
  })

  // Grant cloudfront access to bucket
  siteBucket.addToResourcePolicy(new iam.PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [siteBucket.arnForObjects('*')],
    principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
  }))

  new CfnOutput(stack, 'Bucket', { value: siteBucket.bucketName })

  return siteBucket
}