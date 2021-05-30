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
  <div className={`${rank % 2 === 0 ? "even" : "odd"} item`}>
    <div className="details">
      <h2 className="rank">{`#${rank}`}</h2>
      <h3 className="name">{name.toUpperCase()}</h3>
      <h3 className="score">{`Score: ${totalComparative.toFixed(3)}`}</h3>
    </div>
  </div>
);
// <div className="divider" />

export default CryptoCard;
