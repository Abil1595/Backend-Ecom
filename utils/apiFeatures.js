class APIFeatures{
    constructor(query,queryStr)
    {
        this.query=query;
        this.queryStr=queryStr;
    }
    search()
    {
        let keyword= this.queryStr.keyword ?{
            name:{
                $regex:this.queryStr.keyword,
                $options:'i'
            }
        }:{};
        this.query.find({...keyword})
        return this;

    }
    filter()
    {
        const queryStrCopy={...this.queryStr};

        const removeFields=['keyword','limit','page'];
       removeFields.forEach(field=>delete queryStrCopy[field]);
       let queryStr=JSON.stringify(queryStrCopy);
       queryStr= queryStr.replace(/\b(gt|gte|lt|lte)/g, match=>`$${match}`)
       console.log(queryStr)
       this.query.find(JSON.parse(queryStr));  
       return this;
    }
    paginate(resultPage){
        const currentPage= Number(this.queryStr.page) || 1;
        const skip=resultPage* (currentPage-1)
        this.query.limit(resultPage).skip(skip);
        return this; 
    } 
}
module.exports=APIFeatures;