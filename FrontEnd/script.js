const api = 'http://localhost:5678/api/'

const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")
const editAnchors = document.querySelectorAll(".modifier")
const editTopBar = document.querySelector(".editionmode__topbar")
const header = document.querySelector("#header")

let gallery
let modale
let loginForm

/* tests to implement : wrong endpoint, wrong ip, non existent work id, no work at all, selectedcategory non existent, empty gallery on server, empty categories
*/

class APIWrapper {

    static async pushWork(formData)
    {
        try
        {
            const token = Auth.getToken()
            if(token === false) return {"error" : "not connected"}

            let response = await fetch(`${api}works`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData     
            })

            console.log(response)

            return response.ok ? true : "fetch error"
        }
        catch(e)
        {
            return "fetch error"
        }
    }

    static async attemptLog (logs, showErrorCallback) // callback pertinent?
    {
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
                switch(response.status)
                {
                    case 404:
                        showErrorCallback("User not found.")
                        return "Fetch error"
                    break;
                    case 401:
                        showErrorCallback("Not Authorized.")
                        return "Fetch error"
                    break;
                    default:
                        return "Fetch error"
                }
            }
        }
        catch
        {
            showErrorCallback("Server Unavailable. Retry Later.")
            return "Fetch error"
        }
    }

    static async getCategories(){
        try
        {
            let response = await fetch(`${api}categories`)
            //let response = await fetch(`${api}categoriess`) // test error
            return response.ok ? response.json() : "fetch error"
        }
        catch(e)
        {
            return "fetch error"
        }
    }

    // *** EXTRACT CATEGORIES OUT OF WORKS & GET RID OF ANY DUPLICATE
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

            if(token === false) return console.log("not connected.")

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

    #focusEditGallery
    #focusUploadWork
    #activeFocusBoundaries

    constructor(modaleNode) 
    {
        this.ModaleNode_DOM = document.querySelector(modaleNode)
        this.currentBody = "editBody"
        this.editGallery = document.querySelector("#edition__gallery")
        this.editBody = document.querySelector("#body__edit")
        this.uploadBody = document.querySelector("#form__upload")
        this.backButton = document.querySelector("#modale__arrow__back")
        this.dropdownCategories = document.querySelector("#category")
        this.inputFile = document.querySelector("#filetoupload")
        this.previewFile = document.querySelector("#preview__file")
        this.nextModalButton = document.querySelector("#addpicture__button")
        this.form = document.querySelector("#form__upload")
        this.formButton = document.querySelector("#upload__submitbutton")
        this.formErrorBox = document.querySelector(".uploadwork__errorbox")

        this.#focusEditGallery = [document.querySelector("#body__edit").querySelectorAll("a")[0], document.querySelector("#addpicture__button")]
        //this.#focusUploadWork = [document.querySelector("#form__upload").querySelectorAll("a")[0], document.querySelector("#category")]
        this.#focusUploadWork = [document.querySelector("#form__upload").querySelectorAll("a")[0], document.querySelector("#category")]

        this.#activeFocusBoundaries = this.#focusEditGallery

        this.inputFile.addEventListener("change", e => this.previewSelectedImage())
        this.nextModalButton.addEventListener("click", e => this.toggleBodies())
        this.form.addEventListener("submit", e => this.processModalForm(e))
        window.onclick = (event) =>
        {       
            if (event.target == this.ModaleNode_DOM) this.close()
        }
    }

    open()
    {
        this.#scrollLock(true)
        this.ModaleNode_DOM.style.display = "flex"
        this.updateEditGallery()
        this.#setFocusTrap()
        this.form.reset()
    }

    close()
    {
        this.currentBody !== "editBody" ? this.toggleBodies() : this.currentBody
        this.ModaleNode_DOM.style.display = "none"
        this.#scrollLock(false)
        window.location.reload() // no need to remove eventlistener cause reload
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

    #keyboardListener(e)
    {
        const KEYCODE_TAB = 9

        const isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB || e.keyCode == 27) // echap

        if (!isTabPressed) return

        if(e.keyCode == 27)
        {
            return this.close()
        }

        if(e.shiftKey)
        {
            if (document.activeElement === this.#activeFocusBoundaries[0]) { this.#activeFocusBoundaries[1].focus(); e.preventDefault();}
        }
        else
        {
            if (document.activeElement === this.#activeFocusBoundaries[1]) { this.#activeFocusBoundaries[0].focus(); e.preventDefault()}
        }
    }

    #setFocusTrap()
    {
        this.#activeFocusBoundaries[0].focus()
        window.addEventListener('keydown', e => this.#keyboardListener(e)) // no need to remove cause close > reload index
    }

    // *** SWITCH FROM A MODAL TO THE OTHER ONE
    toggleBodies()
    {
        if(this.currentBody !== "editBody")
        {
            this.editBody.style.display = "flex"
            this.uploadBody.style.display = "none"
            this.currentBody = "editBody"
            this.backButton.style.visibility = "hidden"
            this.#activeFocusBoundaries = this.#focusEditGallery
            this.#activeFocusBoundaries[0].focus()
          }
        else
        {
            this.editBody.style.display = "none"
            this.uploadBody.style.display = "flex" 
            this.currentBody = "uploadBody"
            this.updateDropdownCategories()
            this.backButton.style.visibility = "visible"
            this.#activeFocusBoundaries = this.#focusUploadWork
            this.#activeFocusBoundaries[0].focus()
        }
        
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

    showModalFormError(error)
    {
        const formErrorBoxL = document.querySelector(".uploadwork__errorbox")
        formErrorBoxL.innerHTML = error
        formErrorBoxL.style.display = "block"
    }

    async processModalForm(e)
    {
        e.preventDefault()
        const formData = new CustomFormData(this.form)
        let result = await formData.process(this.showModalFormError) // Passing callback to let the destination class manipulates showModalFormError
        if(result !== "validation failed") this.close()
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
        if(this.inputFile.value.includes(".jpg") || this.inputFile.value.includes(".png"))
        {
            this.inputFile.files[0] ? this.previewFile.src = URL.createObjectURL(this.inputFile.files[0]) : this.previewFile.src = "./assets/icons/picture-placeholder.png"
        }
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
            this.showModalFormError("Sorry. We can't retrieve existing categories")
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

      this.validTypes = [
        "image/jpeg",
         "image/png"
      ]
    }

    #isValidFileType(file) 
    {
        return this.validTypes.includes(file)
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

    async process(showModalFormErrorCallback) 
    {
        let formErrors = []
        const datas = {
            "file" : this.get("image"),
            "title" : this.get("title"),
            "category" : this.get("category")
        }

        // * validation process
        if(datas.title.length < 2 || datas.title.length > 128) formErrors.push("Invalid Title ;") 
        if(parseInt(datas.category) === NaN && await this.#isValidCategory(datas.category)) formErrors.push("Unknown Category ;")
        if(datas.file.size < 1 || datas.file.size > 4200000 || datas.file.size === undefined || this.#isValidFileType(datas.file.type) !== true ) formErrors.push("Invalid File")
               
        if(formErrors.length === 0) 
        {
            await APIWrapper.pushWork(this)
        }
        else
        {
            showModalFormErrorCallback(formErrors.reduce((a, c) => a + c, "")) // callback : showModalFormErrorCallback
            return "validation failed"
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

    static showError(withError)
    {
        let errorBox = document.querySelector('.login__errorbox')
        errorBox.style.display = "block"
        errorBox.innerHTML=withError
    }

    static isTokenAlive()
    {
        const cookie = document.cookie
        return cookie.search("token")===-1 ? false : true
    }

    static getToken()
    {   
        const token = document.cookie.split('; ').find((cookie) => cookie.startsWith('token='))?.split('=')[1]
        return token !== undefined ? token : false
    }

    static logout()
    {
        document.cookie = "token=; Max-Age=0;"
        document.cookie = "id=; Max-Age=0;"
        window.location.href = "index.html"
    }

    static async processLogForm(e)
    {
        e.preventDefault()

        const formData = new FormData(loginForm)
        const email = formData.get("email")
        const password = formData.get("password")

        let logs = {"email": email, "password": password}

        if(password === undefined) return this.showError("Password missing.")
        if(password.length<6) return this.showError("Wrong password.")
        // deal with email

        await APIWrapper.attemptLog(logs, this.showError)
    }

    static adminMode()
    {
        editAnchors.forEach(el => 
            {
                el.style.visibility = "visible"
            })
        editTopBar.classList.toggle('editionmode__topbar--on')
        header.classList.toggle('header__padding--notopBar')
        document.querySelector('#button__login').style.display = "none"
        document.querySelector('#button__logout').style.display = "block"
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

/****/

function onloadLog(){

    //--------------
    /*
    MAIN LOG
    */
    //--------------

    loginForm = document.querySelector('#login__form')
    loginForm.addEventListener("submit", e => Auth.processLogForm(e))
}