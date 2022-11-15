const api = 'http://localhost:5678/api/'

/*const galleryContainer = document.querySelector(".gallery")
const filtersContainer = document.querySelector(".filters")*/
const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")
const editIcon = document.querySelectorAll(".edit__icon")
const editTopBar = document.querySelector(".editionmode__topbar")
const header = document.querySelector("#header")
//const opaqueContainer = document.querySelector("#opaque__container")
const editGallery = document.querySelector("#edition__gallery")

let gallery
let modale

// delete final upload
const user = {'email':'sophie.bluel@test.tld','password':'S0phie'}
const unauthorizedUser = {'email':'ezaeaz.ezaeza@test.tld','password':'ezaeza'}


class Gallery {

    #selectedCategory
    #categories

    constructor(gallerySelector, filtersSelector) 
    {
        this.galleryContainer = document.querySelector(gallerySelector)
        this.filtersContainer = document.querySelector(filtersSelector)
        this.#categories = []
        this.#selectedCategory = 0;
    }

    #setSelectedCategory(selectedCategory = 0)
    {
        this.selectedCategory = selectedCategory;
    }

    // *** REMOVE GALLERY AND/OR FILTERS OUT OF THE DOM
    clear(container)
    {
        switch(container) {
            case "gallery":
                while (this.galleryContainer.lastElementChild) 
                {
                    this.galleryContainer.removeChild(this.galleryContainer.lastElementChild); // No innerHTML="" to kill all addeventlistener attached to the childs
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

    // *** GET RID OF DUPLICATES
    #SetCategories_withNoDuplicates(data){
        let pushedIds = []
        this.categories = []

        for(let i=0; i<Object.keys(data).length; i++)
        {   
            if(pushedIds.includes(data[i].category.id) === false)
            {
                this.categories.push(data[i].category)
                pushedIds.push(data[i].category.id)
            }
        }
    }

    // *** INSERT A FILTER TO THE DOM
    #addFilter(filterName, filterId)
    {
        //remplacer divs par buttons
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

    // *** INSERT ALL FILTERS WITHOUT DUPLICATES TO THE DOM / MARK THE ACTIVE ONE
    updateFilters(categories, selectedCategory = 0)
    {
        this.#setSelectedCategory(selectedCategory)
        this.clear("filters")
        this.#addFilter("Tous", 0)
        categories.forEach(element => this.#addFilter(element.name, element.id))
    }

    // *** INSERT A PICTURE TO THE DOM
    #addToGallery(work)
    {
        let figure = document.createElement("figure")
        figure.innerHTML = `<img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous"><figcaption>${work.title}</figcaption>` // crossorigin : CORS
        this.galleryContainer.append(figure)
    }

    // *** INSERT A GROUP OF SELECTED FICTURES TO THE DOM
    updateGallery(works, selectedCategory = 0)
    {
        this.#setSelectedCategory(selectedCategory)
        this.clear("gallery")
        for(let i=0; i<Object.keys(works).length; i++){
            // filtering works / 0 = no filter
            if((works[i].category.id === this.selectedCategory)||(this.selectedCategory === 0)) {this.#addToGallery(works[i])}
        }
    }

    async displayGallery_filtered(selectedCategory = 0)
    {
        await fetch(`${api}works`).then((response)=>{

            return response.json()

        }).then((data) => {

            // check if response 200 or 500 ?
    
            this.updateGallery(data, selectedCategory)
            this.#SetCategories_withNoDuplicates(data)
            this.updateFilters(this.categories, selectedCategory)
    
        }).catch(error => {
            //console.error('There was an error!', error);
        })
    }

}

class Modale {

    constructor(modaleNode) 
    {
        this.ModaleNode_DOM = document.querySelector(modaleNode)
        this.TitleNode_DOM
        this.currentModale = "editGallery"
        this.modaleBodyList = {"editGallery" : "div1", "UploadWork" : "div2", "workUploaded" : "div3"}
    }

    open(modaleBody = "editGallery")
    {
        this.#scrollLock(true)
        this.ModaleNode_DOM.style.display="flex"
        //populateModaleGallery()
    }

    close()
    {
        this.ModaleNode_DOM.style.display="none"
        this.#scrollLock(false)
    }

    switchToModale(modaleBody)
    {

    }

    #setTitle(title)
    {
        this.TitleNode_DOM = title
    }

    #scrollLock(bool){
        if(bool)
        {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop
            let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
            window.onscroll = () => {
                window.scrollTo(scrollLeft, scrollTop);
            };
        }else{
            window.onscroll = () => {}
        }
    }
    
}



function isTokenAlive()
{
    //gerer si pas de cookie ou cookie pas string
    const cookie = document.cookie
    return cookie.search("token")===-1 ? false : true
}

function extractWorks(obj)
{
    let works = []

    for(let i=0; i<Object.keys(obj).length; i++)
    {
        works.push({
            'id' : obj[i].id, 
            'title' : obj[i].title, 
            'url' : obj[i].imageUrl, 
            'category' : obj[i].categoryId
            })
    }

    //console.log(works)
    return works

}

function deleteWork(workId){
    console.log("work deleted : ", workId)
}

function getModaleThumbnail(work){

    let div = document.createElement("div")
    div.style.position="relative"
    div.innerHTML=`
    <div style="display:flex; flex-direction:column;">
    <img class="thumb" src="${work.url}" crossorigin="anonymous">
    <a href="#" style="font-size:12px; margin-top:4px;">éditer</a>
    <img class="bin__icon" src="./assets/icons/bin_icon.png" onclick="deleteWork(${work.id})">
    `
    return div
}

async function populateModaleGallery()
{
    await fetch(`${api}works`).then((response)=>{
        return response.json()
    }).then((data) => {

        // reset gallery
        editGallery.innerHTML=""

        // get works as an array of objects of data
        const works = extractWorks(data)


        works.forEach(work => 
        {
            let thumb = getModaleThumbnail(work)
            editGallery.append(thumb)
        })

    }).catch(error => {
        console.log(error)
    })
}

async function log(login, password)
{

    let logs = {"email": user.email, "password": user.password}

    let response = await fetch(`${api}users/login`, 
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
    })
    //console.log(response.ok)
    return await response.json()

}

function showEditButtonsonIndex(){
    editIcon.forEach(el => 
        {
            el.classList.toggle('edit__icon--on')
            //el.addEventListener('click', populateModaleGallery())
        })
    editTopBar.classList.toggle('editionmode__topbar--on')
    header.classList.toggle('header__padding--notopBar')
}

function tryLog ()
{
    //$event.preventDefault()
    //console.log('trying to log sir')
    log(email, password).then((userDatas) => 
    {
        //if(user === undefined){}
        document.cookie = `id=${userDatas.userId}; Secure`;
        document.cookie = `token=${userDatas.token}; Secure`;
        window.location.href = "index.html"
    })
}

function onloadIndex(){
    gallery = new Gallery(".gallery",".filters")
    modale = new Modale("#opaque__container")
    gallery.displayGallery_filtered() // 0 = nofilter
    isTokenAlive() ? showEditButtonsonIndex() : false
}

