import ethers from 'ethers';
import config from '../../config';

interface Event {
  address: string;
  topics: Array<string>;
}

class EventSubscriber {
  private static instance: EventSubscriber;
  public positionFilter: Event;
  public fundingPaymentFilter: Event;
  public pnlRealizedFilter: Event;

  constructor() {
    if (EventSubscriber.instance instanceof EventSubscriber) {
      return EventSubscriber.instance;
    }
    EventSubscriber.instance = this;
    this.positionFilter = {
      address: config.POSITIONING_CONTRACT_ADDRESS,
      topics: [ethers.utils.id('PositionChanged(address,address,int256,int256,uint256,int256)')],
    };
    this.fundingPaymentFilter = {
      address: config.POSITIONING_CONTRACT_ADDRESS,
      topics: [ethers.utils.id('FundingPaymentSettled(address,address,int256)')],
    };
    this.pnlRealizedFilter = {
      address: config.POSITIONING_CONTRACT_ADDRESS,
      topics: [ethers.utils.id('PnlRealized(address,int256)')],
    };
  }
}
export default EventSubscriber;
