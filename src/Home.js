import React, {Component} from 'react';
import './Home.css';
import Card from './Card';
import SearchBar from './SearchBar';
import TopBar from './TopBar.js';
import axios from 'axios';
import {db, storageRef} from './fireApi';

class userData{
    constructor(obj){
        this.username    = obj.username;
        this.name        = obj.name;
        this.low         = obj.low;
        this.high        = obj.high;
        this.start_time  = obj.start_time;
        this.end_time    = obj.end_time;
        this.dist        = obj.dist;
        this.pic         = obj.pic;
        this.quote       = obj.quote;
        this.preferences = obj.preferences;
        this.promise     = null;
    }

}
const _default = {username: '',
                 name: '',
                 low: 0,
                 high:0,
                 start_time: '',
                 end_time:'',
                 dist: 0,
                 quote: '',
                 pic:'',
                 preferences: []
             }

/**
 *    [WIP] Each added user will receive a Card component to represent them in a session.
 */
export default class Home extends Component{

    // Queries businesses around UCLA that match the specified category
    getLocation = category => {
      return axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://api.yelp.com/v3/businesses/search`, {
        headers: {
          Authorization: `Bearer XyLNjPiVmPm-_-Og2rpIVSqVUNbsAihqwf21PVcmpbmhQow8HEAflaDDLiO8rT6SmehRVMyJNLz-OqjyiwXCqy45-EIE7yVttnY9440F04drNBm_ceiBgnsVUWNEXnYx`,
          'X-Requested-With': `XMLHttpRequest`,
        },
        params: {
          categories: `${category}`,

          // UCLA's coordinates
          latitude: 34.0689,
          longitude: -118.4452,
        }
      });
    };

    constructor(props){
        super(props);
        this.state={
            showSearch: false,
            all: [],
            users: [],
            filter: '',
            searchVal: '',
            showSearch: false,
            searchFocus: false,
            queryResult: null
        }
    }

    handleSearchBar = (e) => {
        if(e.key === 'Escape'){
            this.setState({
                showSearch: false,
                searchVal: ''
            })

        }
        if("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".includes(e.key) &&
           !this.state.showSearch && this.state.searchVal === ''){
            this.setState({
                showSearch: true,
            })
        }

    }

    componentWillMount(){
        db.collection("users").get().then((querySnapshot) => {
                var l = [];
                querySnapshot.forEach((doc)=>{
                    l.push(new userData(doc.data()))});
                // this.setState({all: l})
                return l;
            }).then((users)=>{
                users.forEach((user)=>user.promise = this.getURL(user.pic));
                this.setState({all:users});
            })
        // var l = [];
        // this.state.all.forEach((user)=>{user.promise = this.getURL(user.pic); l.push(user)})
        // this.setState({all:l})
        document.addEventListener('keydown', this.handleSearchBar);

    }

    searchChange = (e) =>{
        this.setState({searchVal: e.target.value})
        // if(e.target.value===''){
        //     this.setState({
        //         showSearch:false
        //     })
        // }
    }
    getURL = (p) => storageRef.child(p).getDownloadURL();

    render(){

        // Sets state to first search result for default value "hiking"
        // Note it takes a few seconds to fetch this, but will fetch -> load new
        //    screen when displaying result
        if(this.state.queryResult == null) {
        // this.getLocation("hiking").then((response) =>
        //   this.setState({
        //     queryResult:response.data.businesses[0].name
        //   })
        // ).catch(function (response) {
        //   console.log(response);
        // });
      }
      console.log("query result: " + this.state.queryResult);
        return(
            <div >
            <div> <TopBar/> </div>
                <div className="flex justify-center" style={{paddingTop: 60}}>
                    {this.state.all.map((u)=><Card data={u} imgURL = {this.getURL(u.pic)}/>)}
                </div>
                <SearchBar userData={this.state.all} inputRef={this.inputRef} searchFocus={this.state.searchFocus} searchChange={this.searchChange} showSearch = {this.state.showSearch} searchVal ={this.state.searchVal}/>
            </div>
        );
    }


}
