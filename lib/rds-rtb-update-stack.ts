import { Stack, StackProps } from "aws-cdk-lib"
import { CfnRoute, CfnVPCPeeringConnection, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface RdsRtbProps extends StackProps{
    PEERING_CONNECTION: CfnVPCPeeringConnection
    RDS_VPC : Vpc,
    CLOUD9_VPC_CIDR : string
}

export class RdsRtbStack extends Stack{
    constructor(scope : Construct, id : string, props : RdsRtbProps){
        super(scope, id, props)
        //add rtb

        props.RDS_VPC.isolatedSubnets.forEach(({routeTable : {routeTableId}}, index)=>{
            new CfnRoute(this, 'private-peering-rtb' + index, {
                destinationCidrBlock: props.CLOUD9_VPC_CIDR,
                routeTableId,
                vpcPeeringConnectionId: props.PEERING_CONNECTION.ref
            })
        })
    }
}