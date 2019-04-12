const dispatch = () => {
    ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {status: {}};
        this.queue = [];
        setInterval(() => {
            var task;
            while (task = this.queue.shift()) {
                var r = task();
                r && console.log(r);
            }
        }, 1000);

        var getStatus = () => {
            $.get('/api/areas').then((status)=> {
                console.log(status);
                this.setState({status: status})
            }).then(() => setTimeout(() => this.queue.push(getStatus), 5000));

        };

        this.queue.push(getStatus);
    }


    render() {
        return (
            <div className="area">
                {Object.getOwnPropertyNames(this.state.status).map((areaName) => {
                    if (this.state.status[areaName] && this.state.status[areaName] != "disabled") {
                        return (
                            <div key={areaName}>
                                <div className="row">
                                    <div className={"col-sm status-" + (this.state.status[areaName] || 'unknown')} style={{height: "5px"}}>
                                    </div>
                                </div>
                                <div className="row">
                                    {/* <div className="col-sm">
                                     <input className="btn arming-regular" type="button" value="Régulier" onClick={() => $.post(`/api/areas/${areaName}/regular`)}/>
                                     </div> */}
                                    <div className="col-sm">
                                        <input className="btn arming-forced" type="button" value="Armer" onClick={() => this.queue.push(() => {$.post(`/api/areas/${areaName}/forced`)})}/>
                                    </div>
                                    <div className="col-sm">
                                        <input className="btn arming-immediate" type="button" value="Immediat" onClick={() => $.post(`/api/areas/${areaName}/immediate`)}/>
                                    </div>
                                    <div className="col-sm">
                                        <input className="btn arming-partial" type="button" value="Partiel" onClick={() => $.post(`/api/areas/${areaName}/partial`)}/>
                                    </div>
                                    <div className="col-sm">
                                        <input className="btn arming-ready" type="button" value="Désarmer" onClick={() => $.post(`/api/areas/${areaName}/ready`)}/>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
        );
    }
}
