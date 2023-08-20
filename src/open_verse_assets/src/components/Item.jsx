import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal"
import Button from "./Button";
import { open_verse } from "../../../declarations/open_verse";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();

  const id = props.id;

  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localHost});
  //TODO: When Deploying Live, Remove The Below Line
  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT(){

    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    setName(name);

    const owner = await NFTActor.getOwner();
    setOwner(owner.toText());

    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));
    setImage(image);

    
    if (props.role == "collection") {

      const nftIsListed = await open_verse.isListed(props.id);
      if (nftIsListed) {
        setOwner("Open Verse");
        setBlur({filter: "blur(4px)"});
        setSellStatus("Listed");
      } else {
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }

    } else if (props.role == "discover") {

      const originalOwner = await open_verse.getOriginalOwner(props.id);
      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />); 
      }

      const price = await open_verse.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />)
    }

  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;
  function handleSell() {

    console.log("Sell Clicked!");
    setPriceInput(<input
      placeholder="Price in NEBULA"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => price=e.target.value}
    />);

    setButton(<Button handleClick={sellItem} text={"Confirm"} />);

  }

  async function sellItem() {

    setBlur({filter: "blur(4px)"});
    setLoaderHidden(false);
    const listingResult = await open_verse.listItem(props.id, Number(price));
    console.log(listingResult);
    if (listingResult == "Success") {
      const openVerseId = await open_verse.getOpenVerseCansiterID();
      const transferResult = await NFTActor.transferOwnership(openVerseId);
      console.log(transferResult);
      if (transferResult == "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("Open Verse");
        setSellStatus("Listed");
      }
    }
  }

  async function handleBuy() {
    console.log("buy was clicked");
  }

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
