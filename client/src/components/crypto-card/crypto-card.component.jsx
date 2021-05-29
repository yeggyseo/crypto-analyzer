import React from "react";

import "./crypto-card.style.scss";

const CryptoCard = ({
  name,
  numberOfTweets,
  avg,
  rank,
  totalComparative,
  totalScore,
}) => (
  <div className="item">
    <div className="details">
      <h1 className="rank">{`#${rank}`}</h1>
      <h2 className="name">{name.toUpperCase()}</h2>
      <h2 className="score">{`Score: ${totalComparative.toFixed(3)}`}</h2>
    </div>
    <div className="divider" />
  </div>
);

export default CryptoCard;
