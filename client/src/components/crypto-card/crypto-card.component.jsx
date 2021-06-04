import React from "react";
import { AiOutlineSmile } from "react-icons/ai";
import { IoSadOutline } from "react-icons/io5";

import "./crypto-card.style.scss";

const CryptoCard = ({ name, rank, totalComparative }) => (
    <div className="item">
        <div className="details">
            <h2 className="rank">{`#${rank}`}</h2>
            <h3 className="name">{name.toUpperCase()}</h3>
            <div className="score-container">
                <img className="sentiment-icon" src="/sentiment.png" alt="" />
                <h3 className="score">{`Score: ${totalComparative.toFixed(
                    1
                )}%`}</h3>
                {totalComparative.toFixed(1) < 0 ? (
                    <IoSadOutline size={25} />
                ) : (
                    <AiOutlineSmile size={25} />
                )}
            </div>
        </div>
        <div className="divider" />
    </div>
);

export default CryptoCard;
