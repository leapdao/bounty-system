import getReputation, { Reputation } from "./getReputation";

const el = (name: string, children?: HTMLElement[] | Text[]) => {
  const res = document.createElement(name);
  (children || []).forEach(kid => res.appendChild(kid));
  return res;
};

const text = (text) => document.createTextNode(text);

const entry = (account, amount) => 
  el('tr', [
    el('td', [text(account)]),
    el('td', [text(amount)]),
  ]);

getReputation().then((reputation: Reputation[]) => {
  const repList = document.createElement("tbody");
  reputation.forEach((rep) => {
    repList.appendChild(entry(rep.account, rep.reputation));
  });
  document.getElementById('repTable').appendChild(repList);
});
