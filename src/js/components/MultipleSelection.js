export default class MultipleSectionSearch {
  /**
    select from dom innerText value to do filter and add method
    eg: <li>Singapore</li>
    DOM structure
    <div id="country-wrapper">
      <div id="country-token-label">
        <div id="input-wrapper">
          <input id="country-input" type="text">
        </div>
      </div>
      <div id="country-dropdown">
          <ul>
            <li>Singapore</li>
          </ul>
      </div>
  </div>
  */
  constructor() {
    this.selected = [];
    this.countryNames = [];
    this.focusInput = this.focusInput.bind(this);
    this.shouldInputBreakLine = this.shouldInputBreakLine.bind(this);
    this.addCountryToLabel = this.addCountryToLabel.bind(this);
    this.filterCountry = this.filterCountry.bind(this);
    this.blurInput = this.blurInput.bind(this);
    //this.setupEvents = this.setupEvents.bind(this);
  }

    setupEvents() {
    // register all events
    var self = this;
    this.body = document.querySelector("body");
    this.countryWrapper = document.querySelector("#country-wrapper");
    this.countryLabelWrapper = document.querySelector("#country-token-label");
    this.countryInput = document.querySelector("#country-input");
    this.countryDropdown = document.querySelector("#country-dropdown");
    this.dropdownUlTag = document.querySelector("#country-dropdown ul");
    this.mobileForceSetHeight = document.querySelector(".forceSetHeightMobileMultiSelect");
    //this.space4MultiSelect=document.querySelector("#space4MultiSelect");
    this.countryLists = Array.from(
      document.querySelectorAll("#country-dropdown li")
    );
    this.inputWrapper = document.querySelector("#input-wrapper");

    this.body.addEventListener("click", self.blurInput);
    this.countryWrapper.addEventListener("click", self.focusInput);
    this.countryInput.addEventListener("scroll", self.shouldInputBreakLine);
    this.countryInput.addEventListener("input", self.filterCountry);
    this.countryDropdown.addEventListener("click", self.addCountryToLabel);

    this.init();
  }

  init() {
    this.countryNames = this.countryLists.map(function (country) {
      return country.innerText.trim();
    });
  }

  focusInput(e) {
    var isCloseBtn = e.target.className === "selected-close" ? true : false;

    // set height pixel for dropdown, max 7 li tag, 1 li tag 46px

    this.dropdownHeightControl();

    if (isCloseBtn) {
      this.removeLabel(e.target.previousElementSibling.innerText);
      if(this.mobileForceSetHeight){
        this.mobileForceSetHeight.style.height = "auto";
      }
    }
    if (!isCloseBtn) {
      this.countryInput.focus();
     
      setTimeout(() => {
        this.countryDropdown.classList.add("active");
        /*
        var dropDownUlHeight =  350;
        if(document.querySelector("#country-dropdown ul")){
          dropDownUlHeight = parseInt(document.querySelector("#country-dropdown ul").style.height) || 350
        }
        var ddlHeightHalf = dropDownUlHeight/2;
        if(this.space4MultiSelect){
          this.space4MultiSelect.style.height = ddlHeightHalf +"px";
        }
        */
      }, 100);
    }
  }

  dropdownHeightControl() {
    var totalActiveCountry = this.countryLists.filter(function (country) {
      var isFiltered = country.classList.length >= 1 ? true : false;

      return isFiltered ? false : true;
    });
    this.dropdownUlTag.scrollTop = 0;
    var tempDropDownUlHeight =  0;
    for(var i = 0;i<totalActiveCountry.length;i++){
      if (i === 7) { break; }
      tempDropDownUlHeight = tempDropDownUlHeight + totalActiveCountry[i].clientHeight;
    }
    this.dropdownUlTag.style.height = tempDropDownUlHeight +"px";
   
    
    if(this.mobileForceSetHeight){
      var mobileMultiSelectContainerHeight = parseInt(this.mobileForceSetHeight.clientHeight);
      
      var containerComputedStyle = window.getComputedStyle(this.mobileForceSetHeight);
      var dropDownUlHeight = parseInt(this.dropdownUlTag.clientHeight) || tempDropDownUlHeight;
      var paddingTop = parseInt(containerComputedStyle.paddingTop) || 0;
      var paddingBottom =  parseInt(containerComputedStyle.paddingBottom) || 0;
      if((this.mobileForceSetHeight.style.height == "auto" || this.mobileForceSetHeight.style.height == "") && screen.width <= 600)
      {
        var calculateHeight = mobileMultiSelectContainerHeight - paddingTop - paddingBottom + dropDownUlHeight;
        this.mobileForceSetHeight.style.height =  calculateHeight + "px";
      }
    }
    
    /*
    this.dropdownUlTag.style.height =
      totalActiveCountry.length >= 7
        ? 46 * 7 + "px"
        : totalActiveCountry.length * 46 + "px";
        */
  }

  removeDropdownHeight() {
    this.dropdownUlTag.style.height = "0";

    
    if(this.mobileForceSetHeight){
      this.mobileForceSetHeight.style.height = "auto";
    }
    
  }

  removeLabel(string) {
    var self = this;

    this.countryLists.forEach(function (country) {
      var index = self.selected.indexOf(string);
      if (index >= 0 && country.innerText == string) {
        // remove it from dom
        // var id = country.innerText.split(" ").join("-");
        // var children = document.getElementById(id);
        // self.countryLabelWrapper.removeChild(children);

        // remove value from this.selected value
        self.selected.splice(index, 1);

        // remove className from li tag
        country.classList.remove("selected");
      }
    });

    this.isHidePlaceHolder();
  }

  isHidePlaceHolder() {
    if (this.selected.length)
      this.countryInput.classList.add("hidePlaceHolder");
    else this.countryInput.classList.remove("hidePlaceHolder");
  }

  shouldInputBreakLine(e) {
    // no space move to next new line
    e.target.style.width = "auto";
    e.target.style.flex = "1";
  }

  addCountryToLabel(e) {
    var countryName = e.target.innerText;
    // var id = countryName.split(" ").join("-");
    // var countrySelectedLabel = `
    //   <div id=${id} class="selected-token">
    //     <span>${e.target.innerHTML}</span>
    //     <div class="selected-close">
    //       &times;
    //     </div>
    //   </div>
    // `;

    // add to selected array
    this.selected.push(countryName);

    // remove selected value in dropdown (add selected class in li tag)
    this.hideSelectedCountry();
    this.isHidePlaceHolder();

    // remove dropdown class active
    this.countryDropdown.classList.remove("active");
    /*
    if(this.space4MultiSelect){
      this.space4MultiSelect.style.height = 0 +"px";
    }
    */
    // this.inputWrapper.insertAdjacentHTML("beforebegin", countrySelectedLabel);
    this.removeDropdownHeight(); 

    e.stopPropagation();
    if (this.countryInput.value.length && countryName) {
      this.countryInput.value = "";
      // remove filtered class
      this.countryLists.forEach(function (country) {
        country.classList.remove("filtered");
      });
    }
  }

  blurInput() {
    var target = this.countryDropdown;
    if (target.className.includes("active")) {
      this.countryDropdown.classList.remove("active");
      
      if(document.querySelector(".forceSetHeightMobileMultiSelect")){
        document.querySelector(".forceSetHeightMobileMultiSelect").style.height = "auto";
      }
      
    }
  }

  hideSelectedCountry() {
    var self = this;
    this.countryLists.forEach(function (country) {
      if (self.selected.includes(country.innerHTML)) {
        country.classList.add("selected");
      }
    });
  }

  // addHighlighted(fullText, search) {
  //     var result = fullText.replace(new RegExp(search, "gi"), (match) => `<mark>${match}</mark>`);
  //     return result;
  // }

  filterCountry() {
    var self = this;
    var search = this.countryInput.value.toLowerCase().trim();

    this.countryLists.forEach(function (country) {
      if (country.innerText.toLowerCase().trim().includes(search)) {
        // if(search.length) {
        //   country.innerHTML = self.addHighlighted(country.innerText, search)
        // } else {
        //   country.innerHTML = country.innerText
        // }
        country.classList.remove("filtered")
      } else {
        country.classList.add("filtered");
      }
    });
    this.dropdownHeightControl();
  }
}
/*
window.addEventListener("DOMContentLoaded", function (e) {
  console.log("test111")
  var MultipleSelection = new MultipleSectionSearch();

  MultipleSelection.setupEvents();
});
*/