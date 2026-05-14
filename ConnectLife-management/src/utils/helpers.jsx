import React from "react";

export function flagIcon(market) {
  return <span className={`flag ${market.code.toLowerCase()}`} aria-label={`${market.name} flag`} />;
}

export function optionLabel(market) {
  return `${market.code} ${market.localName} (${market.code})`;
}

export function Table({ headers, rows, minWidth = 680 }) {
  return (
    <div className="table-wrap">
      <table style={{ minWidth }}>
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export function iconSvg(name) {
  const icons = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.1 2.4 3.2 5.4 3.2 9S14.1 18.6 12 21M12 3c-2.1 2.4-3.2 5.4-3.2 9s1.1 6.6 3.2 9" /></>,
    sliders: <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4" />,
    file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h8" /></>,
    link: <path d="M10 13a5 5 0 0 0 7.1 0l2.1-2.1a5 5 0 0 0-7.1-7.1L11 4.9M14 11a5 5 0 0 0-7.1 0l-2.1 2.1a5 5 0 0 0 7.1 7.1L13 19.1" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[name]}</svg>;
}