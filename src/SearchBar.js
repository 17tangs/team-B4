import React, {Component} from 'react';
import {Fade, Zoom} from 'react-reveal';
import './SearchBar.css';


export default class SearchBar extends Component{

    componentDidUpdate() {
      this.inputRef.focus();
    }
    constructor(props){
        super(props);
        this.state={
            imgURL:{},
        }
    }

    componentDidMount(){
        console.log(this.props.userData);
        var l = {}
        this.props.userData.forEach((user)=>{if(user.promise) user.promise.then(url=>{l[user.username] = url})})
        this.setState({imgURL:l})
    }


    filterCards = () =>{
        return this.props.userData.map((user)=>{
            if(user.username.toLowerCase().includes(this.props.searchVal.toLowerCase()) && this.props.searchVal !== ''){
                var grey = this.props.display[user.username] ? 'grey' : 'selected';
                return <Fade collapse duration={500} when={true}>
                    <div onClick={()=>{this.props.addCard(user);}} className={`searchResult ${grey}`}>@{user.username}</div></Fade>
                }
            else
                return <Fade collapse duration={500} when={false}><div onClick={()=>{this.props.addCard(user);}} className="searchResult">@{user.username}</div></Fade>
            }
        )
    }

    render(){
        return(
            <div className="search flex justify-center" style={this.props.showSearch ? {backgroundColor:`rgba(0,0,0,0.5)`} : {zIndex:-1}}>
                <Fade top collapse duration={500} when={this.props.showSearch}>
                    <div className="searchBox">
                        <input className="searchInput" ref={(input) => {this.inputRef=input}}  type="text" value = {this.props.searchVal} onChange={this.props.searchChange} placeholder="Search"/>
                        {this.filterCards()}
                    </div>
                </Fade>
            </div>



        )
    }
}
