import { useFrame } from "@/lib/farcaster/provider";
import { FrameContext } from "@farcaster/frame-core/dist/context";
import sdk from "@farcaster/frame-sdk";

interface FarcasterContextResult {
  context: FrameContext;
  actions: typeof sdk.actions | null;
  isEthProviderAvailable: boolean;
}

interface NoContextResult {
  type: null;
  context: null;
  actions: null;
  isEthProviderAvailable: boolean;
}

type ContextResult = FarcasterContextResult | NoContextResult;

export const useMiniAppContext = (): ContextResult => {
  try {
    const farcasterContext = useFrame();
    console.log("farcasterContext", farcasterContext);
    if (farcasterContext.context) {
      return {
        context: farcasterContext.context,
        actions: farcasterContext.actions,
        isEthProviderAvailable: farcasterContext.isEthProviderAvailable,
      } as FarcasterContextResult;
    }
  } catch (e) {
    console.log("e", e);
  }

  return {
    context: null,
    actions: null,
  } as NoContextResult;
};
