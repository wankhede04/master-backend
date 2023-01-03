class Liquidation {
  private static instance: Liquidation;

  constructor() {
    if (Liquidation.instance instanceof Liquidation) {
      return Liquidation.instance;
    }
    Liquidation.instance = this;
  }

  public async liquidate(): Promise<void> {
    console.log('At liquidation service ...');
    /**
     * Add logic to:
     *  - Get all data from order table
     *  - Call Positioning.isLiquidateable(address trader)
     *  - If true,
     *    - Update DB
     *    - Call Positioning.liquidate()
     *  - If false,
     *    - skip to next entry
     */
  }
}
export default Liquidation;
