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
    <td style={{ textAlign: 'right', fontSize: '80%', color: '#77838f' }}>{formatEthereumTimestamp(p.timestamp)}</td>
    <td>{formatWei(p.amount)}</td>
  </tr>;

const App = () => {
  const [reputationPoints, setReputationPoints] = useState<AccountReputation[] | null>(null);
  const [expanded, setExpanded] = useState<string>("");
  useEffect(() => {
    getReputationPoints().then(repPoints =>
      setReputationPoints(reputationForAccounts(repPoints))
    );
  }, []);
  if (!reputationPoints) {
    return <div>Calculating..</div>;
  }

  const toggleExpanded = (account: string) =>
    setExpanded(expanded === account ? "" : account);

  const showExpandable = (account: string) =>
    expanded === account ? 'table-row-group' : 'none'

  return <table style={{ border: 0, borderSpacing: '7px' }}>
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
  </table>;
};

render(<App />, document.getElementById('app'))