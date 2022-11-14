const api = 'http://localhost:5678/api/'
const galleryContainer = document.querySelector(".gallery")
const filtersContainer = document.querySelector(".filters")
const loginButton = document.querySelector("nav > ul > li:nth-child(3)")
const contactButton = document.querySelector("nav > ul > li:nth-child(2)")
const editIcon = document.querySelectorAll(".edit__icon")
const editTopBar = document.querySelector(".editionmode__topbar")
const header = document.querySelector("#header")
const editModeContainer = document.querySelector("#opaque__container")
const editGallery = document.querySelector("#edition__gallery")

// delete final upload
const user = {'email':'sophie.bluel@test.tld','password':'S0phie'}
const unauthorizedUser = {'email':'ezaeaz.ezaeza@test.tld','password':'ezaeza'}

// creer class pr gallery edit avec ts les elements


function emptyGallery()
{
    galleryContainer.innerHTML=""
}

function emptyFilters()
{
    filtersContainer.innerHTML=""
}

function tokenAlive()
{
    //gerer si pas de cookie ou cookie pas string
    const cookie = document.cookie
    /*console.log(typeof(cookie))
    console.log(cookie)*/
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

function getWorks(obj)
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

    console.log(works)
    return works

}

async function populateEditGallery()
{
    await fetch(`${api}works`).then((response)=>{
        return response.json()
    }).then((data) => {

        // reset gallery
        editGallery.innerHTML=""

        // get works as an array of objects of data
        const works = getWorks(data)


        works.forEach(work => 
        {
            let div = document.createElement("div")
            let img = document.createElement("img")
            let bin_icon = document.createElement("img")
            div.style.position="relative"
            img.crossOrigin="anonymous"
            img.src=work.url
            img.classList.add("work__img")
            bin_icon.src = "./assets/icons/bin_icon.png"
            bin_icon.classList.add("bin__icon")
            div.append(img)
            div.append(bin_icon)
            editGallery.append(div)
        })

    }).catch(error => {
        console.log(error)
    })
}

// !!! deal with errors
// selectedCategoryId 0 = no filter
async function filterWork(selectedCategoryId)
{
    await fetch(`${api}works`).then((response)=>{
        //console.log(response.ok)
        return response.json()
    }).then((data) => {

        // check if response 200 or 500 ?
        //console.log(data)
    
        let categories = []
        let pushedIds = []

        emptyGallery()
        emptyFilters()
        
        console.log(data)
        console.log(typeof(data))
    
        for(let i=0; i<Object.keys(data).length; i++)
        {
            let work = document.createElement("figure");
            
            // select works where id === selectedCategoryId or all works if selectedCategoryId === 0
            if((data[i].category.id === selectedCategoryId)||(selectedCategoryId === 0)) {
                work.innerHTML = `<img src="${data[i].imageUrl}" alt="${data[i].title}" crossorigin="anonymous"><figcaption>${data[i].title}</figcaption>` // CORS
                //verifier que gallerycontainer exist
                galleryContainer.append(work)
            }
    
            // try get same result with set
            // push a category {id, name} only if the current id hasn't been pushed yet
            if(pushedIds.includes(data[i].category.id) === false)
            {
                categories.push(data[i].category)
                pushedIds.push(data[i].category.id)
            }
        }
    
        let buttonAll = document.createElement("div")
        buttonAll.textContent = "Tous"
        buttonAll.classList.add("filter")
        selectedCategoryId === 0 ? buttonAll.classList.add("filter--on") : buttonAll.classList.add("filter--off")
        buttonAll.addEventListener("click", () => filterWork(0))
        filtersContainer.append(buttonAll)

        // remplacer div par buttons
        categories.forEach(element => { 
            let button = document.createElement("div")
            button.textContent = element.name
            button.addEventListener("click", () => filterWork(element.id))
            button.classList.add("filter")
            selectedCategoryId === element.id ? button.classList.add("filter--on") : button.classList.add("filter--off")
            filtersContainer.append(button)
        })
    }).catch(error => {
        //element.parentElement.innerHTML = `Error: ${error}`;
        //console.error('There was an error!', error);
        console.log(error)
        //implement can't load gallery in the gallery div
    })
}

async function log(login, password)
{

    let logs = {"email": login, "password": password}

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
    console.log(response.ok)
    return await response.json()

}

function showEditButtonsonIndex(){
    editIcon.forEach(el => 
        {
            el.classList.toggle('edit__icon--on')
            //el.addEventListener('click', populateEditGallery())
        })
    editTopBar.classList.toggle('editionmode__topbar--on')
    header.classList.toggle('header__padding--notopBar')
}

//MAIN

/*loginButton.addEventListener("click", () => log(email, password).then((userDatas) => {
    user = userDatas
    document.cookie = `id=${userDatas.id}; token=${userDatas.token}; Secure`;
}))
contactButton.addEventListener("click", () => {
    if(user === undefined){
        console.log("LOG FIRST")
    }else{
        console.log(user)
    }
})*/

function tryLog ()
{
    //console.log('trying to log sir')
    log(email, password).then((userDatas) => 
    {
        //if(user === undefined){}
        document.cookie = `id=${userDatas.userId}; Secure`;
        document.cookie = `token=${userDatas.token}; Secure`;
        window.location.href = "index.html"
    })
}

function scrollLock(){
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    window.onscroll = function() {
        window.scrollTo(scrollLeft, scrollTop);
    };
}

function switchToEditMode(){
    scrollLock()
    //editModeContainer.classList.toggle('opaque__container--visible')
    editModeContainer.style.display="flex"
    populateEditGallery()

}

function indexOnLoad(){
    filterWork(0)
    tokenAlive() ? showEditButtonsonIndex() : false
}