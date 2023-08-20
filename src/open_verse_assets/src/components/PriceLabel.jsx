import React from "react";

function PriceLabel(props) {
    return ( 
    <div className="disButtonBase-root disChip-root makeStyles-price-23 disChip-outlined">
          <span className="disChip-label">{props.sellPrice} NEBULA</span>
        </div>
    )
};

export default PriceLabel;