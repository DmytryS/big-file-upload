import React, { Component } from "react";

class Progress extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div
                className="ProgressBar"
                style={{
                    "width": "100%",
                    "height": "8px",
                    "backgroundColor": "rgb(183, 155, 229)",
                    "borderRadius": "5px"
                }}
            >
                <div
                    className="Progress"

                    style={{
                        "width": this.props.progress + "%",
                        "backgroundColor": "rgba(103, 58, 183, 1)",
                        "height": "100%",
                        "margin": "0",
                        "borderRadius": "5px"
                    }}
                />
            </div>
        );
    }
}

export default Progress;
