import { Stack, StackProps } from "aws-cdk-lib"
import { CfnRoute, CfnVPCPeeringConnection, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface Cloud9RtbProps extends StackProps{
    PEERING_CONNECTION: CfnVPCPeeringConnection
    CLOUD9_VPC : Vpc,
    RDS_VPC_CIDR : string
}

export class Cloud9RtbStack extends Stack{
    constructor(scope : Construct, id : string, props : Cloud9RtbProps){
        super(scope, id, props)
        //add rtb

        props.CLOUD9_VPC.publicSubnets.forEach(({routeTable : {routeTableId}}, index)=>{
            new CfnRoute(this, 'private-peering-rtb' + index, {
                destinationCidrBlock: props.RDS_VPC_CIDR,
                routeTableId,
                vpcPeeringConnectionId: props.PEERING_CONNECTION.ref
            })
        })
    }
}