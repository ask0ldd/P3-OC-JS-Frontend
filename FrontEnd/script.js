const api = 'http://localhost:5678/api/'
const galleryContainer = document.querySelector(".gallery")
const filtersContainer = document.querySelector(".filters")

/*
<figure>
    <img src="assets/images/abajour-tahina.png" alt="Abajour Tahina">
    <figcaption>Abajour Tahina</figcaption>
</figure>*/

function emptyGallery()
{
    galleryContainer.innerHTML=""
}

function emptyFilters()
{
    filtersContainer.innerHTML=""
}

// !!! deal with errors
// categoryId 0 = no filter
function filteredWork(categoryId){

    fetch(`${api}works`).then((response)=>{
        return response.json()
    }).then((data) => {
    
        console.log(data)
    
        let categories = []
        let pushedIds = []

        emptyGallery()
        emptyFilters()
    
        for(let i=0; i<Object.keys(data).length; i++)
        {
            let work = document.createElement("figure");
            
            // selectionner uniquement les travaux avec l'id === categoryId ou tous les travaux si categoryId === 0
            if((data[i].category.id === categoryId)||(categoryId === 0)) {
                work.innerHTML = `<img src="${data[i].imageUrl}" alt="${data[i].title}" crossorigin="anonymous"><figcaption>${data[i].title}</figcaption>`
                galleryContainer.append(work)
            }
    
            // getfilters //essayer de faire la mm chose avec set
            // push a category only if no category with its id has been pushed yet
            if(pushedIds.includes(data[i].category.id) === false)
            {
                categories.push(data[i].category)
                pushedIds.push(data[i].category.id)
            }
        }
    
        let buttonAll = document.createElement("div")
        buttonAll.textContent = "Tous"
        buttonAll.classList.add("filter", "filter--on");
        buttonAll.addEventListener("click", () => filteredWork(0))
        filtersContainer.append(buttonAll)

        categories.forEach(element => { 
            let button = document.createElement("div")
            button.textContent = element.name
            button.addEventListener("click", () => filteredWork(element.id))
            button.classList.add("filter", "filter--off");
            filtersContainer.append(button)
        })
    })
}


//MAIN

filteredWork(0) // 0 = All


