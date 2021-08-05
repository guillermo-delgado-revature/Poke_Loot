import { IcuPlaceholder } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, Input, OnInit } from '@angular/core';
import { CardServiceService } from '../card-service.service';
import { ICard } from './ICard';
import { IRarities } from './IRarities';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { IGen } from './IGen';
import { Router } from '@angular/router';
//import { loadavg } from 'os';


@Component({
  selector: 'app-cardcollect',
  templateUrl: './cardcollect.component.html',
  styleUrls: ['./cardcollect.component.css']
})

export class CardCollectComponent implements OnInit {

  userCollection: ICard[];
  fullUserCollection: ICard[];
  raritiesList: IRarities[];
  //raritiesList: number[];
  filterValue: number;
  //genList: IGen[];
  filterValueShiny: boolean;
  private userId = localStorage.getItem('userId');
  pageOfItems!: ICard[];
  @Input() differentUser?: string;
  checkFavorites?: boolean;
  currentIndex : number = 0;
  currentPage: number = 1;
  lastpage!: number;
  genList: IGen[];
  genValue: string = "Any";
  genOptions: string[] = ["Any", "Kanto", "Johto", "Hoen", "Sinnoh", "Unova", "Kalos", "Alola", "Galar"];
  bublapedia: string = 'https://bulbapedia.bulbagarden.net/wiki/';



  constructor(private _cardcollectionService: CardServiceService, private route :Router) {
    this.userCollection = [];
    this.fullUserCollection = [];
    this.filterValue = 0;
    this.filterValueShiny = false;
    this.raritiesList = [];
    this.genList = [];
  }


  ngOnInit(): void {

    if(this.differentUser){
      this.userId = this.differentUser;
    }
    for(let i: number = 0; i <= 809; i++){
      if(i <= 151){
        this.genList.push({PokemonId: i, GenName: "Kanto"});
      }
      else if(i > 151 && i <= 251 ){
        this.genList.push({PokemonId: i, GenName: "Johto"});
      }
      else if(i > 251 && i <= 386 ){
        this.genList.push({PokemonId: i, GenName: "Hoen"});
      }
      else if(i > 386 && i <= 493 ){
        this.genList.push({PokemonId: i, GenName: "Sinnoh"});
      }
      else if(i > 493 && i <= 649 ){
        this.genList.push({PokemonId: i, GenName: "Unova"});
      }
      else if(i > 649 && i <= 721 ){
        this.genList.push({PokemonId: i, GenName: "Kalos"});
      }
      else if(i > 721 && i <= 809 ){
        this.genList.push({PokemonId: i, GenName: "Alola"});
      }
      else{
        this.genList.push({PokemonId: i, GenName: "Galar"});
      }
    }
 
    //console.log(this.genList);
    if (this.userId != null) {
      this._cardcollectionService.GetCardsList(this.userId).subscribe(
        result => {
          for (let i = 0; i < result.length; i++) {

            let PokemonId = result[i].Key.PokemonId;
            let Amount = result[i].Key.QuantityNormal;
            let AmountShiny = result[i].Key.QuantityShiny;
            let RarityId = result[i].Value.RarityId;
            let Link = result[i].Value.SpriteLink;
            let LinkShiny = result[i].Value.SpriteLinkShiny;
            let PokemonName = result[i].Value.PokemonName;

            if (Amount > 0) {
              let Quantity = Amount;
              let SpriteLink = Link;
              let IsShiny = false;
              let IsFavorite = false;
              let card: ICard = { PokemonId, Quantity, RarityId, SpriteLink, PokemonName, IsShiny, IsFavorite };
              this.fullUserCollection.push(card);
            }
            if (AmountShiny > 0) {
              let Quantity = AmountShiny;
              let SpriteLink = LinkShiny;
              let IsShiny = true;
              let IsFavorite = false;
              let card: ICard = { PokemonId, Quantity, RarityId, SpriteLink, PokemonName, IsShiny, IsFavorite };
              this.fullUserCollection.push(card);
            }
          }
          this.filterCollection();
          
        }
      );
      this._cardcollectionService.GetRarityList().subscribe(
        result => {

          result.forEach(element => {
            let RarityId = element.rarityId;
            let RarityName = element.rarityCategory;

            let newRarity: IRarities = { RarityId, RarityName };
            this.raritiesList.push(newRarity);
          });
        }
      );
      
      
    }
  }

  filterCollection(): void {
    this.userCollection = [];
    if(this.checkFavorites){
      this.userCollection = this.userCollection.filter(x => x.IsFavorite == true);
    }

    if (this.filterValue == 0) {
      if (this.filterValueShiny == false) {
        if(this.genValue == "Any"){
        this.userCollection = this.fullUserCollection;
        }else{
          this.fullUserCollection.forEach(element => {
            if (element.IsShiny == this.filterValueShiny) {
              let generation = this.genList.filter(x => x.PokemonId == element.PokemonId)[0];
              //console.log(generation);
              if(generation.GenName == this.genValue){
              this.userCollection.push(element);
              }
            }
          });
        }
      }
      else {
        this.fullUserCollection.forEach(element => {
          if (element.IsShiny == this.filterValueShiny) {
            if(this.genValue == "Any"){
              this.userCollection.push(element);
            }else{
            let generation = this.genList.filter(x => x.PokemonId == element.PokemonId)[0];
            //console.log(generation);
            if(generation.GenName == this.genValue){
            this.userCollection.push(element);
            }
            }
          }
        });
      }

    }
    else {
      this.fullUserCollection.forEach(element => {
        if (this.filterValueShiny == false) {
          if (element.RarityId == this.filterValue) {
            if(this.genValue == "Any"){
              this.userCollection.push(element);
            }else{
            let generation = this.genList.filter(x => x.PokemonId == element.PokemonId)[0];
            if(generation.GenName == this.genValue){
            this.userCollection.push(element);
            }
          }
          }
        }
        else {
          if (element.RarityId == this.filterValue && element.IsShiny == this.filterValueShiny) {
            if(this.genValue == "Any"){
              this.userCollection.push(element);
            }else{
            let generation = this.genList.filter(x => x.PokemonId == element.PokemonId)[0];
            if(generation.GenName == this.genValue){
            this.userCollection.push(element);
            }
            }
          }
        }
      });
    }
    if(this.userCollection != null){
      this.load();
    }
  
        
        



  }

  load(){
    console.log("collenction length = " + this.userCollection.length);
    this.currentIndex = 0;
    this.currentPage = 1;
    this.lastpage = 1 + Math.floor(this.userCollection.length / 25);
    this.pageOfItems = this.userCollection.slice(this.currentIndex, this.currentIndex + 25);
  }

  onChangePageNext() {
    // update current page of items
    this.currentIndex += 25;
    if(this.currentIndex >= this.userCollection.length - 25){
      this.currentIndex = this.userCollection.length - 25;
      this.currentPage = this.lastpage - 1;
    }
    this.currentPage++;
    console.log(this.currentIndex);
    console.log("collenction length = " + this.userCollection.length);
    this.pageOfItems = this.userCollection.slice(this.currentIndex, this.currentIndex + 25);
    //this.pageOfItems = pageOfItems;
}
  onChangePagePrev() {
    // update current page of items
    this.currentIndex -= 25;
    this.currentPage--;
    if(this.currentIndex <= 0){
      this.currentIndex = 0;
      this.currentPage = 1;
    }
    console.log(this.currentIndex);
    this.pageOfItems = this.userCollection.slice(this.currentIndex, this.currentIndex + 25);
    //this.pageOfItems = pageOfItems;
  }

  friends(){
    this.route.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.route.navigate(['/Friends']);
    });
    this.route.navigate(['/Friends']);
    this.route.navigateByUrl('/Friends');
  }

  favorite(card: ICard){
    if(card.IsFavorite){
      //do something
    }
    else{
      //do something else
    }
    //do need to reload the page as we will only see favorites in profile
    card.IsFavorite = !card.IsFavorite;
  }




}
