import { render, h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import getReputationPoints from './data/getReputationPoints';
import { AccountReputation } from './types';
import { reputationForAccounts } from './reputation';

const HighlighDecimals = (number: BigInt) => {
  const str = number.toString();
  return <span>
    {str.slice(0, str.length - str.slice(-18).length)}
    <span style={{ opacity: 0.4 }}>{str.slice(-18)}</span>
  </span>
}

const App = () => {
  const [reputationPoints, setReputationPoints] = useState<AccountReputation[] | null>(null);
  useEffect(() => {
    getReputationPoints().then(repPoints =>
      setReputationPoints(reputationForAccounts(repPoints))
    );
  }, []);
  if (!reputationPoints) {
    return <div>Calculating..</div>;
  }
  return <table style={{ border: 0, borderSpacing: '7px' }}>
    <thead>
      <th>Account</th>
      <th>Reputation</th>
    </thead>
    <tbody>
      {reputationPoints.map(accRepPoints => (<tr>
        <td>{accRepPoints.account}</td>
        <td style={{ textAlign: 'right' }}>{HighlighDecimals(accRepPoints.reputation)}</td>
      </tr>))}
    </tbody>
  </table>;
};

render(<App />, document.getElementById('app'))