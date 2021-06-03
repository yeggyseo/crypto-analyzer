import React from "react";
import { AiOutlineSmile } from "react-icons/ai";
import { IoSadOutline } from "react-icons/io5";

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
      <div className="score-container">
        <h3 className="score">{`Score: ${totalComparative.toFixed(3)}`}</h3>
        {totalComparative.toFixed(3) < 0 ? (
          <IoSadOutline size={25} />
        ) : (
          <AiOutlineSmile size={25} />
        )}
      </div>
    </div>
  </div>
);

export default CryptoCard;
