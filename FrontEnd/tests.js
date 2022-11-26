class test {
    constructor ()
    {

    }

    parseCategories_Test(functionToTest)
    {
        const blankArray = []

        const test1and3 = 
        [
            {
              "id": 1,
              "categoryId": 1,
              "category": {
                "id": 1,
                "name": "One"
              }
            },
            {
                "id": 1,
                "categoryId": 3,
                "category": {
                    "id": 3,
                    "name": "Three"
                }
            }
        ]

        const oneCategoryMissing = 
        [
            {
              "id": 1,
              "categoryId": 1,
              "category": {
                    "id": 1,
                    "name": "One"
              }
            },
            {
                "id": 1,
                "categoryId": 1
            }
        ]

        const twoCategoriesOneNameMissing = 
        [
            {
                "id": 1,
                "categoryId": 1,
                "category": {
                    "id": 1,
                    "name": "One"
                }
            },
            {
                "id": 1,
                "categoryId": 3,
                "category": {
                    "id": 3
                }
            }
        ]

        functionToTest()

    }
}