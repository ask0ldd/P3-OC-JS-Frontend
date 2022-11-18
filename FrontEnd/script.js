const api = 'http://localhost:5678/api/'

const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")
const editIcons = document.querySelectorAll(".edit__icon")
const editTopBar = document.querySelector(".editionmode__topbar")
const header = document.querySelector("#header")


let gallery
let modale

// !!! delete before final upload
const user = {'email':'sophie.bluel@test.tld','password':'S0phie'}
const unauthorizedUser = {'email':'ezaeaz.ezaeza@test.tld','password':'ezaeza'}

/* tests to implement : wrong endpoint, wrong ip, non existent work id, no work at all, selectedcategory non existent, empty gallery on server, empty categories

*/

class APIWrapper {

    static convertImgtoBinString(){
       
    }

    static async postWork(formData)
    {
        if(Auth.isTokenAlive()){
            try
            {
                const token = Auth.getToken()
                let feedback = await fetch(`${api}works`, 
                {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        /*'Content-Type': 'multipart/form-data',*/
                        'Authorization': `Bearer ${token}`
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: formData     
                })
                console.log(feedback)
                return feedback
            }
            catch(e)
            {
                console.log(e)
                return "error"
            }
        }

    }

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

        // check the nature of works, if works is missing or has the wrong format/type
        // test work ? 
        works.forEach( el => {
            if(pushedIds.includes(el.category.id) === false)
            {
                categories.push(el.category)
                pushedIds.push(el.category.id)
            }
        })

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

    static async getWorks_nCategories()
    {
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

    deleteWork(workId)
    {
        console.log("work deleted : ", workId)
    }
}


/****/


class Gallery {

    //--------------
    /*
    GALLERY : Handle the Gallery on the index page
    */
    //--------------

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

        // filtering works / 0 = no filter
        works.forEach( el => {
            if((el.category.id === this.selectedCategory)||(this.selectedCategory === 0)) {this.#addToGallery(el)}
        })
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


/****/


class Modale {

    //--------------
    /*
    MODALE : Handle the Modale & toggle between the two UI
    */
    //--------------

    constructor(modaleNode) 
    {
        this.ModaleNode_DOM = document.querySelector(modaleNode)
        this.currentBody = "editBody"
        this.editGallery = document.querySelector("#edition__gallery")
        this.editBody = document.querySelector("#body__edit")
        this.uploadBody = document.querySelector("#form__upload")
        this.dropdownCategories = document.querySelector("#category")
        this.inputFile = document.querySelector("#filetoupload")
        this.previewFile = document.querySelector("#preview__file")
        this.switchButton = document.querySelector("#addpicture__button")
        this.form = document.querySelector("#form__upload")

        this.inputFile.addEventListener("change", e => this.previewSelectedImage())
        this.switchButton.addEventListener("click", e => this.toggleBodies())
        this.form.addEventListener('submit', e => this.processForm(e))
    }

    /*********** */
    processForm(e){ //extends FormData
        // check size among others & if exists
        e.preventDefault()
        
        const formData = new FormData(this.form)

        // validate data before post
        const datas = {
            "file" : formData.get("image"),
            "title" : formData.get("title"),
            "category" : formData.get("category")
        }

        console.log(datas)

        APIWrapper.postWork(formData)
    }

    open()
    {
        this.#scrollLock(true)
        this.ModaleNode_DOM.style.display="flex"
        this.updateEditGallery()
        // better to call when toggling
        this.updateDropdownCategories()
    }

    close()
    {
        this.currentBody !== "editBody" ? this.toggleBodies() : this.currentBody
        this.ModaleNode_DOM.style.display="none"
        this.#scrollLock(false)
    }

    toggleBodies()
    {
        if(this.currentBody !== "editBody")
        {
            this.editBody.style.display="flex"
            this.uploadBody.style.display="none"
            this.currentBody = "editBody"
        }
        else
        {
            this.editBody.style.display="none"
            this.uploadBody.style.display="flex" 
            this.currentBody = "uploadBody"
        }
        
    }

    #addThumbnail(work)
    {
        const div = document.createElement("div")

        div.style.position = "relative"
        div.innerHTML = `
        <div style="display:flex; flex-direction:column;">
        <img class="thumb" src="${work.imageUrl}" crossorigin="anonymous">
        <a href="#" style="font-size:12px; margin-top:4px;">éditer</a>
        <img class="bin__icon" src="./assets/icons/bin_icon.png" onclick="deleteWork(${work.id})">`
        this.editGallery.append(div)
    }

    #clearEditGallery()
    {
        while (this.editGallery.lastElementChild) 
        {
            this.editGallery.removeChild(this.editGallery.lastElementChild)
        }
    }

    async updateEditGallery()
    {
        const works = await APIWrapper.getWorks()

        this.#clearEditGallery()
        works.forEach( el => this.#addThumbnail(el))
    }

    #clearDropdown(){
        while (this.dropdownCategories.lastElementChild) 
        {
            this.dropdownCategories.removeChild(this.dropdownCategories.lastElementChild)
        }
    }

    previewSelectedImage(){
        // check file.size before previewing
        this.inputFile.files[0] ? this.previewFile.src = URL.createObjectURL(this.inputFile.files[0]) : this.previewFile.src = "./assets/icons/picture-placeholder.png"
    }

    async updateDropdownCategories()
    {
        const categories = await APIWrapper.getCategories()

        this.#clearDropdown()
        categories.forEach( el => 
        {
            let option = document.createElement("option")
            option.value = el.id
            option.textContent = el.name
            this.dropdownCategories.append(option)
        })
    }

    #scrollLock(bool = false)
    {
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


/****/


class Auth {

    //--------------
    /*
    AUTH : Helper related to the auth processes
    */
    //--------------

    static isTokenAlive()
    {
        // deal w/ errors : no cookie or no string type
        const cookie = document.cookie
        return cookie.search("token")===-1 ? false : true
    }

    static getToken()
    {   //handle missing cookie, why "?"
        //document.cookie = "test1=Hello; SameSite=None; Secure";
        const token = document.cookie.split('; ').find((cookie) => cookie.startsWith('token='))?.split('=')[1]
        return token ? token : false
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





/***
 * MAIN****
 ***/

function onloadIndex(){
    APIWrapper.convertImgtoBinString()
    gallery = new Gallery(".gallery",".filters")
    modale = new Modale("#opaque__container")
    gallery.displayGallery_filtered() // 0, blank = nofilter
    Auth.isTokenAlive() ? Auth.adminMode() : false // replace login par hi sophie
}

