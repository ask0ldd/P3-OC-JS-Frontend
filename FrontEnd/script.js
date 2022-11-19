const api = 'http://localhost:5678/api/'

const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")
const editIcons = document.querySelectorAll(".edit__icon")
const editTopBar = document.querySelector(".editionmode__topbar")
const header = document.querySelector("#header")

/*const APIErrors = ['Fetch Error', ]
const formErrors = {'file' : 'File Size Error', 'category' : 'Unknown Category', 'title' : 'Incorrect Title', 'token' : 'Log First'}
const logErrors = ['User Unknown', 'Not An Email']*/

let gallery
let modale

// !!! delete before final upload
const user = {'email':'sophie.bluel@test.tld','password':'S0phie'}
const unauthorizedUser = {'email':'ezaeaz.ezaeza@test.tld','password':'ezaeza'}

/* tests to implement : wrong endpoint, wrong ip, non existent work id, no work at all, selectedcategory non existent, empty gallery on server, empty categories
*/

class APIWrapper {

    static async pushWork(formData)
    {
        try
        {
            const token = Auth.getToken()

            if(token === false) return {"error" : "not connected"}

            let response = await fetch(`${api}works`, // delete useless params below
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData     
            })

            return response.ok ? true : "fetch error"
        }
        catch(e)
        {
            return "fetch error"
        }
    }

    static async getCategories(){
        try
        {
            let response = await fetch(`${api}categories`)
            return response.ok ? response.json() : "fetch error"
        }
        catch(e)
        {
            return "fetch error"
        }
    }

    // *** Extract Categories out of works & get rid of any duplicate
    static parseCategories(works)
    {
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

    static async getWorks()
    {
        try{
            let response = await fetch(`${api}works`)
            return response.ok ? response.json() : "fetch error"
        }

        catch(e){
            console.log(e)
            return "fetch error"
        }
    }

    static async deleteWork(workId)
    {
        try
        {
            const token = Auth.getToken()

            if(token === false) return {"error" : "not connected"}

            let response = await fetch(`${api}works/${workId}`, // delete useless params below
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }   
            })

            return response.ok ? false : "fetch error"
        }
        catch(e)
        {
            return "fetch error"
        }
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
        p.innerHTML = error ? `${error}<br><br>` : "Network Error. Can't display Gallery."
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
        if(allWorks !== "fetch error")
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
        //this.modale = document.getElementById("opaque__container");
        this.currentBody = "editBody"
        this.editGallery = document.querySelector("#edition__gallery")
        this.editBody = document.querySelector("#body__edit")
        this.uploadBody = document.querySelector("#form__upload")
        this.dropdownCategories = document.querySelector("#category")
        this.inputFile = document.querySelector("#filetoupload")
        this.previewFile = document.querySelector("#preview__file")
        this.switchButton = document.querySelector("#addpicture__button")
        this.form = document.querySelector("#form__upload")
        this.formButton = document.querySelector("#upload__submitbutton")

        this.inputFile.addEventListener("change", e => this.previewSelectedImage())
        this.switchButton.addEventListener("click", e => this.toggleBodies())
        //this.formButton.addEventListener("click", e => this.submitForm(e))
        this.form.addEventListener("submit", e => this.submitForm(e))
        window.onclick = (event) =>
        {       
            if (event.target == this.ModaleNode_DOM) this.close()
        }
    }

    submitForm(e)
    {
        e.preventDefault()
        /*e.stopPropagation()
        e.stopImmediatePropagation()*/
        const formData = new CustomFormData(this.form)
        formData.process()
        /*toggleBodies()*/
        this.form.reset()
        this.close()
    }

    open()
    {
        this.#scrollLock(true)
        this.ModaleNode_DOM.style.display = "flex"
        this.updateEditGallery()
        // better to call when toggling
        this.updateDropdownCategories()
    }

    close()
    {
        this.currentBody !== "editBody" ? this.toggleBodies() : this.currentBody
        this.ModaleNode_DOM.style.display = "none"
        this.#scrollLock(false)
        window.location.reload()
    }

    toggleBodies()
    {
        if(this.currentBody !== "editBody")
        {
            this.editBody.style.display = "flex"
            this.uploadBody.style.display = "none"
            this.currentBody = "editBody"
        }
        else
        {
            this.editBody.style.display = "none"
            this.uploadBody.style.display = "flex" 
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
        <img class="bin__icon" src="./assets/icons/bin_icon.png" onclick="modale.deleteWork(${work.id})">`
        this.editGallery.append(div)
    }

    async deleteWork(id)
    {
        await APIWrapper.deleteWork(id)
        await this.updateEditGallery()
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

        if(works !== "fetch error")
        {
            this.#clearEditGallery()
            works.forEach( el => this.#addThumbnail(el))
        }
        else
        {
            // show error > editgallery
        }
    }

    #clearDropdown()
    {
        while (this.dropdownCategories.lastElementChild) 
        {
            this.dropdownCategories.removeChild(this.dropdownCategories.lastElementChild)
        }
    }

    previewSelectedImage()
    {
        this.inputFile.files[0] ? this.previewFile.src = URL.createObjectURL(this.inputFile.files[0]) : this.previewFile.src = "./assets/icons/picture-placeholder.png"
    }

    async updateDropdownCategories()
    {
        const categories = await APIWrapper.getCategories()

        if(categories !== "fetch error")
        {
            this.#clearDropdown()
            categories.forEach( el => 
            {
                let option = document.createElement("option")
                option.value = el.id
                option.textContent = el.name
                this.dropdownCategories.append(option)
            })
        }
        else
        {
            // dropdown error
        }
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

class CustomFormData extends FormData {

    //--------------
    /*
    Extends FormData to add a validation & process method
    */
    //--------------

    constructor(form) {
      super(form)

      this.fileTypes = [
        "image/jpeg",
         "image/png"
      ]
    }

    #isValidFileType(file) 
    {
        return this.fileTypes.includes(file)
    }

    async #isValidCategory(category) 
    {
        const categories = await APIWrapper.getCategories()
        let ids = []

        if(categories !== "fetch error")
        {
            categories.forEach( el => ids.push(el.id))
            console.log(ids.includes(parseInt(category)))
            return ids.includes(parseInt(category)) ? true : false
        }
        else
        {
            return false
        }
    }

    async process() {
        let formErrors = []
        const datas = {
            "file" : this.get("image"),
            "title" : this.get("title"),
            "category" : this.get("category")
        }

        if(datas.title.length < 1 && datas.title.length > 128) formErrors.push("Invalid Title") 
        if(parseInt(datas.category) === NaN && await this.#isValidCategory(datas.category)) formErrors.push("Unknown Category") // verifier dans liste categories
        if(datas.file.size < 1 || datas.file.size > 4200000 || datas.file.size === undefined || this.#isValidFileType(datas.file.type) !== true ) formErrors.push("Invalid File")
        
        console.log(formErrors)
  
        // fetch error test
        //return formErrors.length === 0 ? await APIWrapper.pushWork(this) : formErrors

        await APIWrapper.pushWork(this)

        // if APIWrapper.pushWork === true sinon error
    }
  }

/****/


class Auth {

    //--------------
    /*
    AUTH : Helper related to the auth processes
    */
    //--------------

    errorBox = document.querySelector('.login__errorbox')

    static showError(withError)
    {
        errorBox.innerHTML=withError
    }

    static isTokenAlive()
    {
        // deal w/ errors : no cookie or no string type
        const cookie = document.cookie
        return cookie.search("token")===-1 ? false : true
    }

    static getToken()
    {   // handle missing cookie
        //document.cookie = "test1=Hello; SameSite=None; Secure";
        const token = document.cookie.split('; ').find((cookie) => cookie.startsWith('token='))?.split('=')[1]
        return token !== undefined ? token : false
    }

    static async LogInAttempt()
    {
        // validate champs
        let logs = {"email": user.email, "password": user.password} // new formData()

        try{
            let response = await fetch(`${api}users/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logs)        
            })

            if(response.ok)
            {
                let userDatas = await response.json()
                document.cookie = `id=${userDatas.userId}; Secure`
                document.cookie = `token=${userDatas.token}; Secure`
                window.location.href = "index.html"
            }
            else
            {
                this.showError("fetch error")
                return "fetch error"
            }
        }
        catch
        {
            this.showError("fetch error")
            return "fetch error"
        }


        /*
        fetch(`${api}users/login`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logs)        
        }).then((response) => {
            return response.json()
        }).then((userDatas)=>{
            document.cookie = `id=${userDatas.userId}; Secure`
            document.cookie = `token=${userDatas.token}; Secure`
            window.location.href = "index.html"
        })*/

        console.log("tried to log")

        // error message > form when login failed
    }

    static logout()
    {
        // remove cookie
        window.location.href = "index.html"
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

/****/

function onloadIndex(){

    //--------------
    /*
    MAIN
    */
    //--------------

    gallery = new Gallery(".gallery",".filters")
    modale = new Modale("#opaque__container")
    gallery.displayGallery_filtered() // 0, blank = nofilter
    Auth.isTokenAlive() ? Auth.adminMode() : false // replace login par logout
}