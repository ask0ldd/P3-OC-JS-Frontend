const api = 'http://localhost:5678/api/'

/*const galleryContainer = document.querySelector(".gallery")
const filtersContainer = document.querySelector(".filters")*/
const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")
const editIcon = document.querySelectorAll(".edit__icon")
const editTopBar = document.querySelector(".editionmode__topbar")
const header = document.querySelector("#header")
const opaqueContainer = document.querySelector("#opaque__container")
const editGallery = document.querySelector("#edition__gallery")

// delete final upload
const user = {'email':'sophie.bluel@test.tld','password':'S0phie'}
const unauthorizedUser = {'email':'ezaeaz.ezaeza@test.tld','password':'ezaeza'}


class Gallery {

    constructor(gallerySelector, filtersSelector) 
    {
        this.galleryContainer = document.querySelector(gallerySelector)
        this.filtersContainer = document.querySelector(filtersSelector)
        this.filterButtons = []
        this.selectedCategory = 0;
    }

    setSelectedCategory(selectedCategory)
    {
        this.selectedCategory = selectedCategory;
    }

    // REMOVE GALLERY AND/OR FILTERS OUT OF THE DOM
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

    removeFiltersDuplicates(){

    }

    // INSERT A FILTER TO THE DOM
    addFilter(filterName, filterId)
    {
        //remplacer divs par buttons
        let button = document.createElement("div")
        button.textContent = filterName
        button.addEventListener("click", () => 
        {
            populateFiltersnGallery(filterId)
        })
        button.classList.add("filter")
        this.selectedCategory === filterId ? button.classList.add("filter--on") : button.classList.add("filter--off")
        this.filtersContainer.append(button)
    }

    // INSERT ALL FILTERS WITHOUT DUPLICATES TO THE DOM / MARK THE ACTIVE ONE
    updateFilters(categories, selectedCategory)
    {
        this.setSelectedCategory(selectedCategory)
        this.clear("filters")
        this.addFilter("Tous", 0)
        categories.forEach(element => this.addFilter(element.name, element.id))
    }

    // INSERT A PICTURE TO THE DOM
    addToGallery(work)
    {
        let figure = document.createElement("figure")
        figure.innerHTML = `<img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous"><figcaption>${work.title}</figcaption>` // crossorigin : CORS
        this.galleryContainer.append(figure) // verifier que gallery container exists
    }

    // INSERT A GROUP OF SELECTED FICTURES TO THE DOM
    updateGallery(works, selectedCategory)
    {
        this.setSelectedCategory(selectedCategory)
        this.clear("gallery")
        for(let i=0; i<Object.keys(works).length; i++){
            // add to gallery works with id === selectedCategoryId or all works if selectedCategoryId === 0
            if((works[i].category.id === this.selectedCategory)||(this.selectedCategory === 0)) {this.addToGallery(works[i])}
        }
    }

    async displayFilteredGallery(selectedCategory){

        await fetch(`${api}works`).then((response)=>{
            return response.json()
        }).then((data) => {

            // check if response 200 or 500 ?
            let categories = []
            let pushedIds = []
    
            this.updateGallery(data, selectedCategory)
        
            for(let i=0; i<Object.keys(data).length; i++)
            {   
                // try get same result with set
                // push a category {id, name} only if the current id hasn't been pushed yet
                if(pushedIds.includes(data[i].category.id) === false)
                {
                    categories.push(data[i].category)
                    pushedIds.push(data[i].category.id)
                }
            }
        
            this.updateFilters(categories, selectedCategory)
    
        }).catch(error => {
            //console.error('There was an error!', error);
            //implement can't load gallery in the gallery div
        })
    }

}

/*function emptyGallery()
{
    galleryContainer.innerHTML=""
}

function emptyFilters()
{
    filtersContainer.innerHTML=""
}*/

function isTokenAlive()
{
    //gerer si pas de cookie ou cookie pas string
    const cookie = document.cookie
    return cookie.search("token")===-1 ? false : true
}

function getUniqueCategories(obj)
{
    let pushedIds = []
    let categories = []

    for(let i=0; i<Object.keys(obj).length; i++)
    {
        // try get same result with set
        // push a category {id, name} only if the current id hasn't been pushed yet
        if(pushedIds.includes(obj[i].category.id) === false)
        {
            categories.push(obj[i].category)
            pushedIds.push(obj[i].category.id)
        }
    }

    return categories
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

// !!! deal with errors
async function populateFiltersnGallery(selectedCategoryId)
{
    await fetch(`${api}works`).then((response)=>{
        //console.log(response.ok)
        return response.json()
    }).then((data) => {

        // check if response 200 or 500 ?
        let categories = []
        let pushedIds = []

        /*gallery.clear("gallery")
        gallery.clear("filters")*/

        gallery.updateGallery(data, selectedCategoryId)
    
        for(let i=0; i<Object.keys(data).length; i++)
        {   
            // try get same result with set
            // push a category {id, name} only if the current id hasn't been pushed yet
            if(pushedIds.includes(data[i].category.id) === false)
            {
                categories.push(data[i].category)
                pushedIds.push(data[i].category.id)
            }
        }
    
        gallery.updateFilters(categories, selectedCategoryId)

    }).catch(error => {
        //console.error('There was an error!', error);
        //implement can't load gallery in the gallery div
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

function scrollLock(bool){
    if(bool)
    {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        window.onscroll = () => {
            window.scrollTo(scrollLeft, scrollTop);
        };
    }else{
        window.onscroll = () => {}
    }
}

//class modale avec open & close, avec add to body, avec empty, setTitle, avec set button value, set button color, avec loadtemplate
function openModale(){
    scrollLock(true)
    opaqueContainer.style.display="flex"
    populateModaleGallery()
}

function closeModale(){
    //depopulate gallery / titre / boutons
    opaqueContainer.style.display="none"
    scrollLock(false)
}

function onloadIndex(){
    gallery = new Gallery(".gallery",".filters")
    gallery.displayFilteredGallery(0) // 0 = nofilter
    isTokenAlive() ? showEditButtonsonIndex() : false
}

let gallery