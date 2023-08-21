import { Stack, StackProps } from "aws-cdk-lib";
import { CfnVPCPeeringConnection } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface VpcPeeringProps extends StackProps {
    VPC_ID : string, //sourceVpc
    PEER_VPC_ID : string, //destVpc
    PEER_OWNER_ID: string,
    REGION: string,
    PEER_ROLE_ARN ?: string
}

export class VpcPeeringStack extends Stack {
    public peering : CfnVPCPeeringConnection
    constructor(scope : Construct, id: string, props : VpcPeeringProps){
        super(scope, id, props)

        this.createPeering(id, props)
    }
    private createPeering(id : string, props : VpcPeeringProps){
        this.peering = new CfnVPCPeeringConnection(this,id, {
            
            vpcId: props.VPC_ID,
            peerVpcId: props.PEER_VPC_ID,
            peerOwnerId: props.PEER_OWNER_ID,
            peerRegion: props.REGION,
            // peerRoleArn: props.PEER_ROLE_ARN,
            tags: [
                {
                    key: "project",
                    value: "CDK"
                },
                {
                    key:  "Name",
                    value: `Peering CDK Demo - ${id}`
                }
            ],

        })
        
    }
}