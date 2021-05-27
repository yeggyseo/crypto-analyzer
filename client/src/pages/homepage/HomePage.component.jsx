import React from "react";

import moment from "moment";
import { ReactComponent as Logo } from "../../assets/cryptocurrency.svg";
import CryptoCard from "../../components/crypto-card/crypto-card.component";

import "./homepage.style.scss";

class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      crypto: [],
    };
  }

  componentDidMount() {
    const testAPI = async () => {
      let response = await fetch("/trending");
      let data = await response.json();

      let temp = [];
      let rank = 1;
      for (let i in data) {
        data[i]["name"] = i;
        data[i]["rank"] = rank;
        data[i]["id"] = rank;
        temp.push(data[i]);
        rank += 1;
      }

      this.setState({ crypto: temp });
    };

    testAPI();
  }

  render() {
    console.log(this.state.crypto);
    const { crypto } = this.state;

    return (
      <div className="container">
        <div className="header">
          <h1 className="title">{`TOP ${this.state.crypto.length} TRENDING CRYPTOCURRENCIES`}</h1>
          <h1 className="date">{moment().format("YYYY/MM/DD")}</h1>
        </div>
        <div className="crypto-list">
          {crypto.map(({ id, ...otherProps }) => (
            <CryptoCard key={id} {...otherProps} />
          ))}
        </div>
      </div>
    );
  }
}

export default HomePage;
