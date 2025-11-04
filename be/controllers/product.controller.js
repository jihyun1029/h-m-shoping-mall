const Product = require("../models/Product");

const PAGE_SIZE = 5;

const productController = {}

productController.createProduct = async (req, res) => {
    try {
        const {
            sku,
            name,
            size,
            image,
            category,
            description,
            price,
            stock,
            status
        } = req.body;
        const product = new Product({
            sku,
            name,
            size,
            image,
            category,
            description,
            price,
            stock,
            status
        });

        await  product.save();
        res.status(200).json({status:"success", product});
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message});
    }
};

// isDeleted false 인것만 가져오기
productController.getProducts = async (req, res) => {
    try {
        // 쿼리값 읽어오기
        const {page, name} = req.query;

        // 만약에 다른 조건들이 추가로 생기면 if문이 더 늘어나야하는 구조
        /*
            if(name) {
                // const products = await Product.find({name:name}); // 이렇게 한다면 키워드가 이것만.
                const products = await Product.find({name:{$regex:name, $options:"i"}}); // 키워드를 포한해서 검색
            } else {
                const products = await Product.find({});
            }
        */

        let response = { status: "success" };

        // 검색 조건이 추가되는 것을 고려해서, 검색 조건을 모아서
        // 검색 조건을 cond에 다 모을 것이다. 만약에 이름이 있다? 검색조건은
        const cond = name
            ? { name: { $regex: name, $options: "i" }, isDeleted: false }
            : { isDeleted: false };

        // query는 컨디션을 추가해주겠다.
        let query = Product.find(cond);
        // 필요에 의해서 값을 추가하거나 안하거나


        if(page) {
            // 10개의 데이터 중 5개씩 보여주고 싶다면?
            // limit는 5
            query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

            // 최종 몇개 페이지
            // 데이터가 총 몇개있는지
            // const totalItemNum = await Product.find(cond).count(); // 현재 버전(v6 이상) 에서는 .count() 메서드가 제거되었고, 대신 .countDocuments() 또는 .estimatedDocumentCount() 를 사용해야 합니다.
            const totalItemNum = await Product.countDocuments(cond);
            // 전체 페이지 개수 = 전체 데이터 개수 / 페이지 사이즈
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

            // 만약에 pgae라는 쿼리가 있고, 페이지네이션이 필요하다면?
            response.totalPageNum = totalPageNum;
        }

        // 쿼리를 따로 실행할 수 있다. 실행을 시키고 싶을때 선언과 실행을 따로 하고 싶을때
        const productList = await query.exec();
        response.data = productList;
        //res.status(200).json({status:"success", data: productList});
        res.status(200).json(response);
        // 상황에 따라서 page에 response가 필요하고 안 필요하고에 따라서 동적인 response를 만들 수 있다.
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message});
    }
};

productController.updateProduct = async (req, res) => {
    try {
        // 어떤 상품을 수정하고 싶은지 id 값을 알아야함
        const productId = req.params.id;
        const {
            sku,
            name,
            size,
            image,
            price,
            description,
            category,
            stock,
            status,
        } = req.body;

        const product = await Product.findByIdAndUpdate(
            {_id:productId},
            {sku, name, size, image, price, description, category, stock, status},
            {new: true}
            );
        if(!product) throw new Error("item doesn't exist");
        res.status(200).json({status: "success", data: product});
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message});
    }
}

// 실제 삭제 로직
productController.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByIdAndUpdate(
            { _id: productId },
            { isDeleted: true }
        );
        if (!product) throw new Error("No item found");
        res.status(200).json({ status: "success" });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

// 상품 상세 조회
productController.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findOne({_id: productId, isDeleted: false});
        if(!product) throw new Error("Product not found");
        res.status(200).json({status: "success", data: product});
    } catch(error) {
        res.status(400).json({status:"fail", error:error.message});
    }
};

productController.checkStock = async (item) => {
    // 내가 사려는 아이템 재고 정보 들고오기
    const product = await Product.findById(item.productId);

    // 내가 사려는 아이템 qty, 재고 비교
    if(product.stock[item.size] < item.qty) {
        // 재고가 불충분하면 불충분 메세지와 함께 데이터 반환
        return { isVerify: false, message: `${product.name}의 ${item.size} 재고가 부족합니다.` };
    }
    // 충분하다면, 재고에서 - qty 성공
    const newStock = {...product.stock};
    newStock[item.size] -= item.qty;
    product.stock = newStock;

    await product.save();
    return {isVerify:true};
}

productController.checkItemListStock = async (itemList) => {
    const insufficientStockItems = []; // 재고가 불충분한 아이템을 저장할 예정
    // 재고 확인 로직
    await  Promise.all(
        itemList.map(async (item) => {
            const stockCheck = await productController.checkStock(item);
            if (!stockCheck.isVerify) {
                insufficientStockItems.push({item, message: stockCheck.message});
            }
            return stockCheck;
        })
    );

    return insufficientStockItems;
}

module.exports = productController;