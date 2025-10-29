import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import SearchBox from "../../common/component/SearchBox";
import NewItemDialog from "./component/NewItemDialog";
import ProductTable from "./component/ProductTable";
import {
  getProductList,
  deleteProduct,
  setSelectedProduct,
} from "../../features/product/productSlice";

const AdminProductPage = () => {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const dispatch = useDispatch();
  const { productList, totalPageNum } = useSelector((state) => state.product);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    page: query.get("page") || 1,
    name: query.get("name") || "",
  }); //검색 조건들을 저장하는 객체

  const [mode, setMode] = useState("new");

  const tableHeader = [
    "#",
    "Sku",
    "Name",
    "Price",
    "Stock",
    "Image",
    "Status",
    "",
  ];

  //상품리스트 가져오기 (url쿼리 맞춰서)
  useEffect(() => {
    dispatch(getProductList({ ...searchQuery }));
  }, [query]);

  useEffect(() => {
    //검색어나 페이지가 바뀌면 url바꿔주기 (검색어또는 페이지가 바뀜 => url 바꿔줌=> url쿼리 읽어옴=> 이 쿼리값 맞춰서  상품리스트 가져오기)

    // 검색어를 입력 안 했다면, searchQuery가 없어도 되니 삭제한다.
    if(searchQuery.name === "") {
      delete searchQuery.name;
    }
    // console.log("qqq", searchQuery);
    // 검색어를 입력했다면 검색어를 url에 들어가는 parameter 형태로 바꿔준다.
    const params = new URLSearchParams(searchQuery);
    // 파라미터 값은 어떻게 생겼는지 궁금해서 확인하려면 URLSearchParams 이라는 이상한 인스턴스 형태로 되어 있는 것을 string 형태로 바꿔줘야 볼 수 있다.
    const queryString = params.toString();
    // 객체가 쿼리 형태로 변하는 것은 URLSearchParams 이것 때문
    // console.log("qqq", query);
    navigate("?" + queryString);
  }, [searchQuery]);

  const deleteItem = (id) => {
    //아이템 삭제하가ㅣ
    // 확인 다이얼로그 표시
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      dispatch(deleteProduct(id));
    }
  };

  const openEditForm = (product) => {
    //edit모드로 설정하고
    setMode("edit");
    // 아이템 수정다이얼로그 열어주기
    dispatch(setSelectedProduct(product));
    // 다이얼로그 열기전에 내가 선택한 아이템을 선택했다 셋팅을 먼저 해줘야 함는. reduex에 저장할 것이다.
    setShowDialog(true);
  };

  const handleClickNewItem = () => {
    //new 모드로 설정하고
    setMode("new");
    // 다이얼로그 열어주기
    setShowDialog(true);
  };

  const handlePageClick = ({ selected }) => {
    //  쿼리에 페이지값 바꿔주기
    //console.log("selected", selected);
    setSearchQuery({ ...searchQuery, page: selected + 1 });
  };

  // searchbox에서 검색어를 읽어온다 => 엔터를 치면 => searchQuery 객체가 업데이트가 됨 {name: 스트레이트 팬츠}
  // => searchQuery 객체 안에 아이템 기준으로 url을 새로 생성해서 호출 &name+스트레이트+팬츠
  // => url 쿼리 읽어오기 => url 쿼리 기준으로 BE에 검색조건과 함께 호출한다.
  return (
    <div className="locate-center">
      <Container>
        <div className="mt-2">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="제품 이름으로 검색"
            field="name"
          />
        </div>
        <Button className="mt-2 mb-2" onClick={handleClickNewItem}>
          Add New Item +
        </Button>

        <ProductTable
          header={tableHeader}
          data={productList}
          deleteItem={deleteItem}
          openEditForm={openEditForm}
        />
        <ReactPaginate
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={totalPageNum } // 전체페이지
          forcePage={searchQuery.page - 1}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          className="display-center list-style-none"
        />
      </Container>

      <NewItemDialog
        mode={mode}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
      />
    </div>
  );
};

export default AdminProductPage;
