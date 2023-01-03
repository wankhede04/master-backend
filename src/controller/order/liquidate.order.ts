import Liquidation from '../../service/scheduler/Liquidation';

export default (): void => {
  console.log('Liquidate ...');
  const liquidation = new Liquidation();
  liquidation.liquidate();
};
