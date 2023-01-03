import Liquidation from '../../service/scheduler/Liquidation';
import { getPositioning, getAccountBalance } from '../../utils/contracts';

export default async (): Promise<void> => {
  const liquidation = new Liquidation();
  await liquidation.liquidate();
};
