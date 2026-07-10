import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgVote, VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/tx";

import { withWebAuthnApproval } from "./shared/webauthn.mjs";

/** Send an authorized YES/NO/ABSTAIN/NO_WITH_VETO vote for a v1beta1 proposal. */
export async function voteOnCosmosProposal({
  rpcEndpoint,
  signer,
  voter,
  proposalId,
  option = VoteOption.VOTE_OPTION_YES,
  credentialId,
  rpId,
  verifyProof,
}) {
  const authorizedSigner = withWebAuthnApproval({ signer, credentialId, rpId, verifyProof });
  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, authorizedSigner);
  try {
    return await client.signAndBroadcast(voter, [{
      typeUrl: "/cosmos.gov.v1beta1.MsgVote",
      value: MsgVote.fromPartial({ proposalId: BigInt(proposalId), voter, option }),
    }], "auto");
  } finally {
    client.disconnect();
  }
}
