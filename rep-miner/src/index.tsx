import { Fragment, render, h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import getReputationPoints from './data/getReputationPoints';
import { AccountReputation, ReputationPoint } from './types';
import { reputationForAccounts } from './reputation';
import formatEthereumTimestamp from './utils/formatEthereumTimestamp';
import formatWei from './utils/formatWei';

const HighlighDecimals = (number: BigInt, showDecimals = false) => {
  const str = number.toString();
  return <span>
    {str.slice(0, str.length - str.slice(-18).length)}
    {showDecimals && <span style={{ opacity: 0.4 }}>{str.slice(-18)}</span>}
  </span>
};

const App = () => {
  const [reputationPoints, setReputationPoints] = useState<AccountReputation[] | null>(null);
  const [expanded, setExpanded] = useState<string>("");
  const [showDecimals, setShowDecimals] = useState<boolean>(false);
  useEffect(() => {
    getReputationPoints().then(repPoints =>
      setReputationPoints(reputationForAccounts(repPoints))
    );
  }, []);

  const renderRepPoint = useCallback(
    (p: ReputationPoint) =>
      <tr>
        <td style={{ textAlign: 'right', fontSize: '80%' }}>
          <a href={`https://etherscan.io/tx/${p.id.split('-')[0]}`}>
          {formatEthereumTimestamp(p.timestamp)}
          </a>
          {' '}
          <span style={{ display: 'inline-block', width: '60px' }}>
            {formatWei(p.amount)} DAI
          </span>
        </td>
        <td style={{ textAlign: 'right' }}>
          {HighlighDecimals(p.reputation || BigInt('0'), showDecimals)}
        </td>
      </tr>,
   [showDecimals]
  );

  const toggleExpanded = (account: string) =>
    setExpanded(expanded === account ? "" : account);

  const showExpandable = (account: string) =>
    expanded === account ? 'table-row-group' : 'none';

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div>
        <p>Once you get a payout of X DAI you receive the same amount of reputation ("reputation point"). Your reputation point decays exponentially then with such a speed that it is reduced by half every 90 days. Your org reputation is the sum of your decayed reputation points.</p>
        <p>You can click the record to reveal all the individual payouts and the corresponding reputation accrued.</p>
        <input type="checkbox" checked={showDecimals} onClick={() => setShowDecimals(!showDecimals)} /> Show decimals
      </div>
      {!reputationPoints && <div style={{ textAlign: 'center' }}>Calculating..</div>}
      {reputationPoints && (
        <table style={{ width: '100%', border: 0, borderSpacing: '7px' }}>
          <thead>
            <th>Account</th>
            <th>Reputation</th>
          </thead>
          {reputationPoints.map(({ account, reputation, points }) => (
            <Fragment>
              <tr style={{ cursor: 'pointer' }} onClick={() => toggleExpanded(account)}>
                <td>{account}</td>
                <td style={{ textAlign: 'right' }}>{HighlighDecimals(reputation, showDecimals)}</td>
              </tr>
              <tbody style={{ display: showExpandable(account) }}>
                {points.
                  sort((a, b) => b.timestamp - a.timestamp).
                  map(p => renderRepPoint(p))}
              </tbody>
            </Fragment>))}
        </table>
      )}
    </main>
  );
};

render(<App />, document.getElementById('app'))