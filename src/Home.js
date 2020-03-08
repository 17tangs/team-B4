import React, {Component} from 'react';
import './Home.css';
import Card from './Card';
import SearchBar from './SearchBar';
import Suggestion from './SuggestionSkeleton.js';
import TopBar from './TopBar.js';
import axios from 'axios';
import {db, storageRef} from './fireApi';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";


export class userData{
    constructor(obj){
        this.username    = obj.username;
        this.first_name        = obj.first_name;
        this.last_name = obj.last_name;
        this.low         = obj.low;
        this.high        = obj.high;
        this.start_time  = obj.start_time;
        this.end_time    = obj.end_time;
        this.dist        = obj.dist;
        this.pic         = obj.pic;
        this.quote       = obj.quote;
        this.preferences = obj.preferences;
        this.promise     = null;
        this.email = obj.email ?? null;
    }

}
const _default = {username: '',
                 first_name: 'John',
                 last_name: "Doe",
                 low: 0,
                 high:0,
                 start_time: '',
                 end_time:'',
                 dist: 0,
                 quote: '',
                 pic:'',
                 preferences: []
             }



const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#ffffff',
        },
        secondary: {
            main: '#2962ff',
        }
    },
    overrides: {
        MuiButton: {
            label: {
                color: '#ffffff',
            },
        }
    }
});

const style = {
    textTransform: 'none',
    borderRadius: '25px',
    width: '150px',
};


/**
 *    [WIP] Each added user will receive a Card component to represent them in a session.
 */
export default class Home extends Component{

    /** Queries businesses around UCLA that match the specified category
     *
     *  @param categories array of places (strings) to include in filter
     *                    note: ["hiking","chinese"] => hiking OR chinese
     *  @return promise for yelp API call
     */
    getLocation = categories => {
      var categoryString = "";
      categories.forEach((x) => {categoryString += x + ","});
      return axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://api.yelp.com/v3/businesses/search`, {
        headers: {
          Authorization: `Bearer XyLNjPiVmPm-_-Og2rpIVSqVUNbsAihqwf21PVcmpbmhQow8HEAflaDDLiO8rT6SmehRVMyJNLz-OqjyiwXCqy45-EIE7yVttnY9440F04drNBm_ceiBgnsVUWNEXnYx`,
          'X-Requested-With': `XMLHttpRequest`,
        },
        params: {
          categories: `${categoryString}`,

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
            display: {},
            filter: '',
            searchVal: '',
            showSearch: false,
            searchFocus: false,
            queryResult: null,
            categories: [],
            showSuggestion: false, // if true, a query has been made
        }
    }

    handleCardDelete = (card) => {
        var s = this.state.display;
        s[card.username] = false;
        this.setState({display:s});
      // var newAll = this.state.all.filter(x => x.username !== card.username);
      // this.setState({all: newAll});
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

    addCard = (user)=>{
        var s = this.state.display;
        s[user.username]=true;
        this.setState({display:s});

    }

    targetHasClickHandler = (event) => {
        let el = event.target;
        while(el) {
        if (el.getAttribute('data-click-handler')) {
           return true;
         }
         el = el.parentElement;
       }
       return false;
     }

    componentWillMount(){
        db.collection("users").get().then((querySnapshot) => {
                var l = [];
                querySnapshot.forEach((doc)=>{
                    l.push(new userData(doc.data()))});
                // this.setState({all: l})
                return l;
            }).then((users)=>{
              users.forEach((user)=>{
                    if(user.pic)
                        user.promise = this.getURL(user.pic)
                });
                this.setState({all:users});
                var s = {};
                this.state.all.forEach((user)=> {s[user.username]=false});
                this.setState({display:s});
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

    /**
     *  @param u user data for newly selected user
     */
    updateFilters = (u) => {
      // If
    }

    genCards = ()=>{
        var l = [];
        this.state.all.forEach((u)=>{
            if(this.state.display[u.username]) {
                l.push(<Card key={u.username}  data={u} imgURL = {u.pic ? this.getURL(u.pic) : ''} deleteCard = {this.handleCardDelete}/>);
                this.updateFilters(u);
            }});
            return l;
    }

    render(){

        // Sets state to first search result for default value "hiking"
        // Note it takes a few seconds to fetch this, but will fetch -> load new
        //    screen when displaying result
        if(this.state.queryResult == null && this.state.showSuggestion) {
         this.getLocation(this.state.categories).then((response) =>
           this.setState({
             queryResult:response.data.businesses[0].name
           })
         ).catch(function (response) {
           console.log(response);
         });
      }
      console.log("query result: " + this.state.queryResult);
      console.log(this.state.all);
        return(
          <div>
            {!this.state.showSuggestion ?
              <div>
              <div> <TopBar/> </div>
                  <div className="flex justify-center" style={{paddingTop: 60}}>
                      {this.genCards()}
                  </div>
                  <div style={{marginTop: '5%', left: '45%', position: 'absolute'}} className="justify-center">
                      <ThemeProvider theme={theme}>
                          <div style={{display: 'flex', 'flex-direction': 'column'}}>
                              <Button data-click-handler="true" variant={"contained"} onClick={()=>{this.handleSearchBar({key:''})}} theme={theme} color={"primary"} style={style}> <div style={{color: "grey"}}>  + Add Person </div> </Button>
                              <div style={{paddingTop: '20px'}}><Button variant={"contained"} onClick={()=>{this.state.showSuggestion = true;}} theme={theme} color={"secondary"} style={style}> Find Me a Place! </Button></div>
                          </div>
                      </ThemeProvider>
                  </div>
                  <div  onClick={(e)=>{
                      if (this.targetHasClickHandler(e))
                        this.handleSearchBar({key:''});
                      else
                        this.handleSearchBar({key:'Escape'});
                  }}>
                      <SearchBar addCard={this.addCard} display={this.state.display} userData={this.state.all} inputRef={this.inputRef} searchFocus={this.state.searchFocus} searchChange={this.searchChange} showSearch = {this.state.showSearch} searchVal ={this.state.searchVal}/>
                  </div>
              </div>
            :<Suggestion name={this.state.queryResult}/>}
          </div>
        );
    }


}
