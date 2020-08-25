import { Fragment, render, h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import getReputationPoints from './data/getReputationPoints';
import { AccountReputation, ReputationPoint } from './types';
import { reputationForAccounts } from './reputation';
import formatEthereumTimestamp from './utils/formatEthereumTimestamp';
import formatWei from './utils/formatWei';

const HighlighDecimals = (number: BigInt) => {
  const str = number.toString();
  return <span>
    {str.slice(0, str.length - str.slice(-18).length)}
    <span style={{ opacity: 0.4 }}>{str.slice(-18)}</span>
  </span>
};

const renderRepPoint = (p: ReputationPoint) =>
  <tr>
    <td style={{ textAlign: 'right', fontSize: '80%' }}>
      <a href={`https://etherscan.io/tx/${p.id.split('-')[0]}`} style={{ textDecoration: 'none' }}>
       {formatEthereumTimestamp(p.timestamp)}
      </a>
    </td>
    <td>{formatWei(p.reputation || '0')}{' '}
      <span style={{ fontSize: '80%', color: '#77838f' }}>of {formatWei(p.amount)}</span>
    </td>
  </tr>;

const App = () => {
  const [reputationPoints, setReputationPoints] = useState<AccountReputation[] | null>(null);
  const [expanded, setExpanded] = useState<string>("");
  useEffect(() => {
    getReputationPoints().then(repPoints =>
      setReputationPoints(reputationForAccounts(repPoints))
    );
  }, []);

  const toggleExpanded = (account: string) =>
    setExpanded(expanded === account ? "" : account);

  const showExpandable = (account: string) =>
    expanded === account ? 'table-row-group' : 'none';

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div>
        <p>Once you get a payout of X DAI you receive the same amount of reputation ("reputation point"). Your reputation point decays exponentially then with such a speed that it is reduced by half every 90 days. Your org reputation is the sum of your decayed reputation points.</p>
        <p>You can click the record to reveal all the individual payouts and the corresponding reputation accrued.</p>
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
                <td style={{ textAlign: 'right' }}>{HighlighDecimals(reputation)}</td>
              </tr>
              <tbody style={{ display: showExpandable(account) }}>
                {points.
                  sort((a, b) => b.timestamp - a.timestamp).
                  map(p => renderRepPoint(p))}
              </tbody>
            </Fragment>))}
        </table>
      )}
    </div>
  )s;
};

render(<App />, document.getElementById('app'))