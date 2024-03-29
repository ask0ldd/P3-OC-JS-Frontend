const api = 'http://localhost:5678/api/'

const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")
const editAnchors = document.querySelectorAll(".modifier")
const editTopBar = document.querySelector(".editionmode__topbar")
const header = document.querySelector("#header")

let gallery
let modale
let loginForm



class APIWrapper {

    // *** NEW WORK > DB
    static async pushWork(formData)
    {
        try
        {
            const token = Auth.getToken()
            if(token === false) return {error : "Not connected"}

            const response = await fetch(`${api}works`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData     
            })

            console.log(response)

            return response.ok ? true : {error : "Can't upload your work"}
        }
        catch(e)
        {
            return {error : "Fetch error"}
        }
    }

    // *** LOGIN ATTEMPT
    static async attemptLog (logs)
    {
        try{
            const response = await fetch(`${api}users/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logs)      
            })

            if(response.ok)
            {
                const userDatas = await response.json()
                document.cookie = `id=${userDatas.userId}; Secure`
                document.cookie = `token=${userDatas.token}; Secure`
                window.location.href = "index.html"
            }
            else
            {
                switch(response.status)
                {
                    case 404:
                        console.log(response.statusText)
                        return {error : "User not found."}
                    break;
                    case 401:
                        console.log(response.statusText)
                        return {error : response.statusText}
                    break;
                    default:
                        console.log(response.statusText)
                        return {error : response.statusText}
                }
            }
        }
        catch
        {
            return {error : "Service Unavailable. Retry Later."}
        }
    }

    // *** GET ALL EXISTING CATEGORIES
    static async getCategories(){
        try
        {
            const response = await fetch(`${api}categories`)
            return response.ok ? response.json() : {error : "Fetch error"}
        }
        catch(e)
        {
            return {error : "Fetch error"}
        }
    }

    // *** EXTRACT CATEGORIES OUT OF WORKS & GET RID OF ANY DUPLICATE
    static parseCategories(works)
    {
        let pushedIds = []
        let categories = []

        works.forEach( el => {
            if(pushedIds.includes(el.category.id) === false)
            {
                categories.push(el.category)
                pushedIds.push(el.category.id)
            }
        })

        return categories
    }

    // *** GET ALL WORKS
    static async getWorks()
    {
        try{
            const response = await fetch(`${api}works`)
            return response.ok ? response.json() : {error : "Fetch error."}
        }

        catch(e){
            return {error : "Fetch error."}
        }
    }

    // *** DELETE SOME WORK WITH A SPECIFIC ID
    static async deleteWork(workId)
    {
        try
        {
            const token = Auth.getToken()

            if(token === false) return console.log({error : "Not connected"})

            const response = await fetch(`${api}works/${workId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }   
            })

            return response.ok ? false : {error : response.statusText}
        }
        catch(e)
        {
            return {error : "Can't reach the API."}
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
                this.galleryContainer.innerHTML = ""
            break;
            case "filters":
                while (this.filtersContainer.lastElementChild) 
                {
                    this.filtersContainer.removeChild(this.filtersContainer.lastElementChild); // [i] No innerHTML = "" to kill all addeventlistener attached to those childs
                }
            break;
            default:
                while (this.filtersContainer.lastElementChild) 
                {
                    this.filtersContainer.removeChild(this.filtersContainer.lastElementChild);
                }
                this.galleryContainer.innerHTML = ""
        }
    }

    // *** INSERT A FILTER > DOM
    #addFilter(filterName, filterId)
    {
        const button = document.createElement("div")
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
        APIWrapper.parseCategories(works).forEach(el => this.#addFilter(el.name, el.id)) // extrait de works pas de second call a l'api
    }

    // *** ERROR > GALLERY
    #displayGalleryErrorMsg(error){
        this.clear()
        const p = document.createElement("p")
        const blankCell = document.createElement("p")
        p.classList.add("gallery__errormsg")
        p.innerHTML = error ? `${error}<br><br>` : "Network Error. The Gallery can't be displayed."
        this.galleryContainer.append(blankCell)
        this.galleryContainer.append(p)
    }

    // *** INSERT A PICTURE + TITLE > DOM
    #addToGallery(work)
    {
        const figure = document.createElement("figure")
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
        const allWorks = await APIWrapper.getWorks()
        if(!allWorks.error)
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
        this.inputFile = document.querySelector("#filetoupload")
        this.nextModalButton = document.querySelector("#addpicture__button")
        this.form = document.querySelector("#form__upload")
        this.formButton = document.querySelector("#upload__submitbutton")
        this.formErrorBox = document.querySelector(".uploadwork__errorbox")

        this.#focusEditGallery = [document.querySelector("#modale__closelink"), document.querySelector("#delete__allworks")] // bornes
        this.#focusUploadWork = [document.querySelector("#modale__backlink"), document.querySelector("#category")]

        this.#activeFocusBoundaries = [...this.#focusEditGallery] // [i] without [...] : Reference type

        this.inputFile.addEventListener("change", e => this.#previewSelectedImage())
        this.nextModalButton.addEventListener("click", e => this.toggleBodies())
        this.form.addEventListener("submit", e => this.processModalForm(e))
        
        window.onclick = (event) =>
        {       
            if (event.target == this.ModaleNode_DOM) this.close()
        }

        // [i] Enable Modal Form Button if all inputs are populated
        this.inputFile.addEventListener("change", e => this.#unlockFormButton())
        document.querySelector("#title").addEventListener("input", e => this.#unlockFormButton())
    }

    open()
    {
        this.#scrollLock(true)
        this.ModaleNode_DOM.style.display = "flex"
        this.updateEditGallery()
        document.querySelector("#modale__backnClose").style.justifyContent = "flex-end"
        this.#setFocusTrap()
    }

    close()
    {
        this.#resetModalForm()
        this.currentBody !== "editBody" ? this.toggleBodies() : this.currentBody
        this.ModaleNode_DOM.style.display = "none"
        this.#scrollLock(false)
        this.#unsetFocusTrap()
        gallery.displayGallery_filtered()

    }

    // *** LOCK THE SCROLLING
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

    // *** ESCAPE / TAB / SHIFT+TAB LISTENED TO
    #keyboardListener(e)
    {
        const KEYCODE_TAB = 9
        const isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB || e.keyCode == 27) // [i] echap

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

    // *** TRAP THE FOCUS INTO THE MODAL WINDOW
    #setFocusTrap()
    {
        this.#activeFocusBoundaries[0].focus()
        window.addEventListener('keydown', e => this.#keyboardListener(e))
    }

    #unsetFocusTrap()
    {
        this.#activeFocusBoundaries[0].focus()
        window.removeEventListener('keydown', e => this.#keyboardListener(e))
    }

    // *** SWITCH FROM A MODAL TO THE OTHER ONE
    toggleBodies()
    {
        const uploadBody = document.querySelector("#form__upload")
        const backLink = document.querySelector("#modale__backlink")
        const modalIcons = document.querySelector("#modale__backnClose")

        if(this.currentBody !== "editBody")
        {
            this.editBody.style.display = "flex"
            uploadBody.style.display = "none"
            this.currentBody = "editBody"
            modalIcons.style.justifyContent = "flex-end"
            backLink.style.display = "none"
            this.#activeFocusBoundaries = [...this.#focusEditGallery] // [i] without ... : Reference
            this.#activeFocusBoundaries[0].focus()
          }
        else
        {
            this.#resetModalForm()
            this.editBody.style.display = "none"
            uploadBody.style.display = "flex" 
            this.currentBody = "uploadBody"
            this.updateDropdownCategories()
            modalIcons.style.justifyContent = "space-between"
            backLink.style.display = "block"
            this.#activeFocusBoundaries = [...this.#focusUploadWork]
            this.#activeFocusBoundaries[0].focus()
        }
        
    }

    // *** CALL A APIWRAPPER METHOD TO DELETE A SELECTED WORK
    async deleteWork(id)
    {
        await APIWrapper.deleteWork(id)
        await this.updateEditGallery()
    }

    // *** CLEAR THE THUMBNAILS GALLERY
    #clearEditGallery()
    {
        while (this.editGallery.lastElementChild) 
        {
            this.editGallery.removeChild(this.editGallery.lastElementChild)
        }
    }

    // *** ADD A THUMBNAIL > MODAL
    #addThumbnail(work)
    {
        const div = document.createElement("div")

        div.style.position = "relative"
        div.innerHTML = `
        <div style="display:flex; flex-direction:column;" onmouseover="document.querySelector('#move${work.id}').style.display='block';" onmouseout="document.querySelector('#move${work.id}').style.display='none';">
        <img class="thumb" src="${work.imageUrl}" crossorigin="anonymous">
        <a href="#" style="font-size:12px; margin-top:4px;">éditer</a>
        <img class="bin__icon" src="./assets/icons/bin_icon.png" onclick="modale.deleteWork(${work.id})">
        <img id="move${work.id}" class="move__icon" src="./assets/icons/move_icon.png">
        </div>`
        this.editGallery.append(div)
    }

    // *** UPDATE THE MODAL GALLERY
    async updateEditGallery()
    {
        const works = await APIWrapper.getWorks()

        if(!works.error)
        {
            this.#clearEditGallery()
            works.forEach( el => this.#addThumbnail(el))
        }
        else
        {
            this.editGallery.innerHTML="<div style='width:420px; text-align:center; font-size:24px;'>Can't load the Gallery.</div>"
        }
    }

    // *** SHOW SOME ERRORS WHEN UNABLE TO UPLOAD SOME NEW WORK
    showModalFormError(error)
    {
        const formErrorBoxL = document.querySelector(".uploadwork__errorbox")
        formErrorBoxL.innerHTML = error
        formErrorBoxL.style.display = "block"
    }

    // *** PROCESS THE FORM DEDICATED TO THE UPLOAD OF NEW WORKS
    async processModalForm(e)
    {
        e.preventDefault()
        const formData = new CustomFormData(this.form)
        const result = await formData.process(this.showModalFormError) // [i] Passing callback to let the destination class manipulates showModalFormError
        if(result !== false) this.close()
    }

    // *** CLEAR THE CATEGORIES INTO THE DROPDOWN LIST > MODAL FORM
    #clearDropdown()
    {
        const dropdownCategories = document.querySelector("#category")

        while (dropdownCategories.lastElementChild) 
        {
            dropdownCategories.removeChild(dropdownCategories.lastElementChild)
        }
    }

    // *** PREVIEW SELECTED IMAGE TO UPLOAD > MODAL FORM
    #previewSelectedImage()
    {
        const labelInputFile = document.querySelector("#fileselect_button")
        const fileSize = document.querySelector(".filesize")
        const previewFile = document.querySelector("#preview__file")

        if((this.inputFile.value.includes(".jpg") || this.inputFile.value.includes(".png")) && this.inputFile.files[0])
        {
            previewFile.src = URL.createObjectURL(this.inputFile.files[0])
            labelInputFile.style.display="none"
            fileSize.style.display="none"
        }
    }

    // *** UPDATE THE CATEGORIES INTO THE DROPDOWN LIST > MODAL FORM
    async updateDropdownCategories()
    {
        const dropdownCategories = document.querySelector("#category")
        const categories = await APIWrapper.getCategories()

        if(!categories.error)
        {
            this.#clearDropdown()
            categories.forEach( el => 
            {
                const option = document.createElement("option")
                option.value = el.id
                option.textContent = el.name
                dropdownCategories.append(option)
            })
        }
        else
        {
            this.showModalFormError("Sorry. We can't retrieve existing categories")
        }
    }

    // *** UNLOCK THE BUTTON OF THE FORM INTO THE MODAL IF CONDITIONS ARE MET
    #unlockFormButton()
    {
        (this.inputFile.value.includes(".jpg") || this.inputFile.value.includes(".png")) 
        ? document.querySelector("#title").value.length > 2 
        ? parseInt(document.querySelector("#category").value) !== NaN 
        ? this.formButton.disabled = false
        : this.formButton.disabled = true : this.formButton.disabled = true : this.formButton.disabled = true
        
        this.formButton.disabled === false ? this.#activeFocusBoundaries[1] = document.querySelector("#upload__submitbutton") : this.#activeFocusBoundaries[1] = this.#focusUploadWork[1]
    }

    #resetModalForm(){
        const labelInputFile = document.querySelector("#fileselect_button")
        const fileSize = document.querySelector(".filesize")
        const previewFile = document.querySelector("#preview__file")

        previewFile.src = "./assets/icons/picture-placeholder.png"
        labelInputFile.style.display="block"
        fileSize.style.display="block"
        this.formButton.disabled = true

        this.form.reset()
    }
    
    async deleteAllWorks()
    {
        const allWorks = await APIWrapper.getWorks()
        
        if(!allWorks.error)
        {
            allWorks.forEach( work => {
                APIWrapper.deleteWork(work.id)
            })
        }

        this.close()
    }
    
}

/****/

class CustomFormData extends FormData {

    //--------------
    /*
    Extends FormData to add a validation & processing method
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

        if(!categories.error)
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

    // *** PROCESS THE MODAL FORM / VALIDATION
    async process(showModalFormErrorCallback) 
    {
        let formErrors = []
        const datas = {
            "file" : this.get("image"),
            "title" : this.get("title"),
            "category" : this.get("category")
        }

        // [i] validation process
        if(datas.title.length < 2 || datas.title.length > 128) formErrors.push("Invalid Title; ") 
        if(parseInt(datas.category) === NaN && await this.#isValidCategory(datas.category)) formErrors.push("Unknown Category; ")
        if(datas.file.size < 1 || datas.file.size > 4200000 || datas.file.size === undefined || this.#isValidFileType(datas.file.type) !== true ) formErrors.push("Invalid File")
               
        if(formErrors.length === 0) 
        {
            const response = await APIWrapper.pushWork(this) 
            if(response.error) 
            {
                showModalFormErrorCallback(response.error)
                return false
            }
        }
        else
        {
            showModalFormErrorCallback(formErrors.reduce((a, c) => a + c, "")) // [i] callback : showModalFormErrorCallback
            return false
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
        const errorBox = document.querySelector('.login__errorbox')
        errorBox.style.display = "block"
        errorBox.innerHTML=withError
    }

    // *** CHECK IF THE AUTH TOKEN IS ALIVE
    static isTokenAlive()
    {
        const cookie = document.cookie
        return cookie.search("token")===-1 ? false : true
    }

    // *** GET THE VALUE OF THE AUTH TOKEN
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

    // *** PROCESS THE LOGIN FORM
    static async processLogForm(e)
    {
        e.preventDefault()

        const formData = new FormData(loginForm)
        const email = formData.get("email")
        const password = formData.get("password")

        const logs = {"email": email, "password": password}

        if(password === undefined) return this.showError("Password missing.")
        if(password.length<6) return this.showError("Wrong password.")
        if(email.length>64) return this.showError("Wrong email.")

        const response = await APIWrapper.attemptLog(logs)

        if(response.error) {this.showError(response.error)}
    }

    // *** SWITCH THE INDEX PAGE TO ADMIN MODE WHEN THE AUTH TOKEN IS ALIVE
    static adminMode()
    {
        editAnchors.forEach(el => 
            {
                el.style.display = "block"
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
    MAIN INDEX
    */
    //--------------

    gallery = new Gallery(".gallery",".filters")
    modale = new Modale("#opaque__container")
    gallery.displayGallery_filtered() // [i] 0, blank = nofilter
    Auth.isTokenAlive() ? Auth.adminMode() : false
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