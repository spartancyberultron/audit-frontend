import "./index.less";
import { Layout } from "antd";
import { SvgIcon } from "../../components/common";
import { useMediaQuery } from "react-responsive";
import Footer from "../Footer";
import React, { useState } from "react";
import Tabs from "./Tabs";
import { Scrollbars } from "react-custom-scrollbars";
import { useNavigate } from "react-router";

import LogoIcon from "../../assets/images/logo-icon.svg";

const { Sider } = Layout;

const SideBar = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(!!isMobile);
  const toggle = () => {
    setIsOpen(!isOpen);
    if (isOpen && isMobile) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  };

  const onTabClick = () => {
    setIsOpen(true);
  }

  return (
    <>
      <Layout
        className={isOpen ? "sidebar-wrapper" : "sidebar-open sidebar-wrapper"}
      >
        <button
          className="sidebar-toggle"
          title="sidebar-toggle"
          onClick={toggle}
        >
          {isMobile ? (
            <SvgIcon
              className={isOpen ? "open" : ""}
              name={isOpen ? "sidebar-menu" : "sidebar-close"}
            />
          ) : (
            <SvgIcon
              className={isOpen ? "open" : ""}
              name={isOpen ? "sidebar-open" : "sidebar-close"}
            />
          )}
        </button>
        <Sider
          collapsible
          breakpoint="lg"
          collapsed={isOpen}
          collapsedWidth="0"
          trigger={null}
        >
          <div className="side_bar">
            <div
              className="logo"
              onClick={() =>
                navigate({
                  pathname: "/",
                })
              }
            >
              <img src={LogoIcon} alt="logo icon" />
              <span>COMMODO</span>
            </div>
            <Scrollbars>
              <div className="side_bar_inner">
                <Tabs onClick={onTabClick} />
              </div>
            </Scrollbars>
            <Footer />
          </div>
        </Sider>
      </Layout>
      <div onClick={toggle}>{isMobile && !isOpen && <div className="sidebar-overlay" />}</div>
    </>
  );
};

export default SideBar;