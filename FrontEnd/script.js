const api = 'http://localhost:5678/api/'

const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")
const editIcons = document.querySelectorAll(".edit__icon")
const editTopBar = document.querySelector(".editionmode__topbar")
const header = document.querySelector("#header")
const editGallery = document.querySelector("#edition__gallery")

let gallery
let modale

// !!! delete before final upload
const user = {'email':'sophie.bluel@test.tld','password':'S0phie'}
const unauthorizedUser = {'email':'ezaeaz.ezaeza@test.tld','password':'ezaeza'}

/* tests to implement : wrong endpoint, wrong ip, non existent work id, no work at all, selectedcategory non existent, empty gallery on server, empty categories

*/

class APIWrapper {
    static async getCategories(){
        try{
            let works = (await fetch(`${api}categories`)).json()
            return works
        }

        catch(e){
            console.log(e)
            return "error"
        }
    }

    // *** Extract Categories out of works & get rid of any duplicate
    static parseCategories(works){
        let pushedIds = []
        let categories = []

        //console.log(works)

        // check the nature of works, if works is missing or has the wrong format/type
        // test work ? 
        for(let i=0; i<Object.keys(works).length; i++)
        {   
            if(pushedIds.includes(works[i].category.id) === false)
            {
                categories.push(works[i].category)
                pushedIds.push(works[i].category.id)
            }
        }

        return categories

        /*let set = new Set()
        for(let i=0; i<Object.keys(works).length; i++)
        {
            set.add(works[i].category.name)
        }
        console.log(set)
        return set*/
    }

    static async getWorks(){
        try{
            // tester 200
            let works = (await fetch(`${api}works`)).json()
            //console.log(await works)
            return works
        }

        catch(e){
            console.log(e)
            return "error"
        }
    }

    static async getWorks_nCategories(){
        try{
            let works = (await fetch(`${api}works`)).json()
            let categories = parseCategories (works)
            return [works, categories]
        }

        catch(e){
            console.log(e)
            return "error"
        }
    }

    static async sendWork(){
        // check token before anything
    }
}


//--------------
/*
GALLERY : Handle the Gallery on the index page
*/
//--------------


class Gallery {

    #selectedCategory
    #categories

    constructor(gallerySelector, filtersSelector) 
    {
        this.galleryContainer = document.querySelector(gallerySelector)
        this.filtersContainer = document.querySelector(filtersSelector)
        this.#categories = []
        this.#selectedCategory = 0
    }

    // *** REMOVE GALLERY AND/OR FILTERS OUT OF THE DOM
    clear(container)
    {
        switch(container) {
            case "gallery":
                while (this.galleryContainer.lastElementChild) 
                {
                    this.galleryContainer.removeChild(this.galleryContainer.lastElementChild); // No innerHTML = "" to kill all addeventlistener attached to those childs
                }
            break;
            case "filters":
                while (this.filtersContainer.lastElementChild) 
                {
                    this.filtersContainer.removeChild(this.filtersContainer.lastElementChild);
                }
            break;
            default:
                while (this.filtersContainer.lastElementChild) 
                {
                    this.filtersContainer.removeChild(this.filtersContainer.lastElementChild);
                }
                while (this.galleryContainer.lastElementChild) 
                {
                    this.galleryContainer.removeChild(this.galleryContainer.lastElementChild);
                }
        }
    }

    // *** INSERT A FILTER > DOM
    #addFilter(filterName, filterId)
    {
        // should replace divs w/ button
        let button = document.createElement("div")
        button.textContent = filterName
        button.addEventListener("click", () => 
        {
            this.displayGallery_filtered(filterId)
        })
        button.classList.add("filter")
        this.selectedCategory === filterId ? button.classList.add("filter--selected") : button.classList.add("filter--unselected")
        this.filtersContainer.append(button)
    }

    // *** INSERT ALL FILTER BUTTONS WITHOUT DUPLICATES > DOM / MARK THE SELECTED ONE
    updateFilters(works, selectedCategory = 0)
    {
        this.selectedCategory = selectedCategory
        this.clear("filters")
        this.#addFilter("Tous", 0)
        APIWrapper.parseCategories(works).forEach(el => this.#addFilter(el.name, el.id))
        /*const cat = await APIWrapper.getCategories()
        cat.forEach(el => this.#addFilter(el.name, el.id))*/
    }

    // *** ERROR > GALLERY
    #displayGalleryErrorMsg(error){
        this.clear()
        let p = document.createElement("p")
        let blankCell = document.createElement("p")
        p.classList.add("gallery__errormsg")
        p.innerHTML = `${error}<br><br>` || "Network Error. Can't display Gallery."
        this.galleryContainer.append(blankCell)
        this.galleryContainer.append(p)
    }

    // *** INSERT A PICTURE + TITLE > DOM
    #addToGallery(work)
    {
        let figure = document.createElement("figure")
        figure.innerHTML = `<img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous"><figcaption>${work.title}</figcaption>` // crossorigin=ano : CORS
        this.galleryContainer.append(figure)
    }

    // *** INSERT A GROUP OF SELECTED WORKS > GALLERY
    updateGallery(works, selectedCategory = 0)
    {
        this.selectedCategory = selectedCategory
        this.clear("gallery")
        for(let i=0; i<Object.keys(works).length; i++){
            // filtering works / 0 = no filter
            if((works[i].category.id === this.selectedCategory)||(this.selectedCategory === 0)) {this.#addToGallery(works[i])}
        }
    }

    async displayGallery_filtered(selectedCategory = 0)
    {
        let allWorks = await APIWrapper.getWorks()
        if(allWorks !== "error")
        {
            this.updateGallery(allWorks, selectedCategory)
            this.updateFilters(allWorks, selectedCategory)
        }
        else
        {
            this.#displayGalleryErrorMsg()
        }
    }
}




//--------------
/*
MODALE : Handle the Modale & toggle between the two UI
*/
//--------------


class Modale {

    constructor(modaleNode) 
    {
        this.ModaleNode_DOM = document.querySelector(modaleNode)
        this.TitleNode_DOM
        this.currentModale = "editGallery"
        this.modaleBodyList = {"editGallery" : "div1", "UploadWork" : "div2", "workUploaded" : "div3"}
        //this.ModaleNode_DOM.addEventListener('click', () => this.close())
        /*document.querySelector("#modale__container").click((e) =>
        {
            e.preventDefault();
            e.stopPropagation();
        })*/
    }

    open(modaleBody = "editGallery")
    {
        this.#scrollLock(true)
        this.ModaleNode_DOM.style.display="flex"
        this.updateEditGallery()
        this.toggleBodies()
    }

    close()
    {
        this.ModaleNode_DOM.style.display="none"
        this.#scrollLock(false)
    }

    toggleBodies(modaleBody = "editGallery")
    {
        // temporary
        //populateModaleGallery()
    }

    #addThumbnail(work){
        let div = document.createElement("div")
        div.style.position="relative"
        div.innerHTML=`
        <div style="display:flex; flex-direction:column;">
        <img class="thumb" src="${work.imageUrl}" crossorigin="anonymous">
        <a href="#" style="font-size:12px; margin-top:4px;">éditer</a>
        <img class="bin__icon" src="./assets/icons/bin_icon.png" onclick="deleteWork(${work.id})">
        `
        editGallery.append(div)
    }

    async updateEditGallery()
    {
        const works = await APIWrapper.getWorks()
        console.log(works)

        for(let i=0; i<Object.keys(works).length; i++){
            this.#addThumbnail(works[i])
        }
    }

    #scrollLock(bool){
        if(bool)
        {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop
            let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
            window.onscroll = () => {
                window.scrollTo(scrollLeft, scrollTop)
            }
        }else{
            window.onscroll = () => {}
        }
    }
    
}




//--------------
/*
AUTH : Methods related to the auth process
*/
//--------------


class Auth {

    static isTokenAlive()
    {
        // deal w/ errors : no cookie or no string type
        const cookie = document.cookie
        return cookie.search("token")===-1 ? false : true
    }

    static LogInAttempt()
    {
        let logs = {"email": user.email, "password": user.password} // new formData()

        fetch(`${api}users/login`, 
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(logs)        
        }).then((response) => {
            return response.json()
        }).then((userDatas)=>{
            document.cookie = `id=${userDatas.userId}; Secure`
            document.cookie = `token=${userDatas.token}; Secure`
            window.location.href = "index.html"
        })

        console.log("tried to log")
    }

    static adminMode(){
        editIcons.forEach(el => 
            {
                el.classList.toggle('edit__icon--on')
            })
        editTopBar.classList.toggle('editionmode__topbar--on')
        header.classList.toggle('header__padding--notopBar')
        // login => hi sophie
    }

    static visitorMode(){
        // login button back
    }
}


// Functions to rework

function deleteWork(workId){
    console.log("work deleted : ", workId)
}

function postWorkTest(image, title, url){
    
}



/***
 * MAIN****
 ***/

function onloadIndex(){
    gallery = new Gallery(".gallery",".filters")
    modale = new Modale("#opaque__container")
    gallery.displayGallery_filtered() // 0, blank = nofilter
    Auth.isTokenAlive() ? Auth.adminMode() : false // replace login par hi sophie
}

