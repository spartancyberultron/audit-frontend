import "./index.scss";
import { Col, Row, SvgIcon } from "../../../components/common";
import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Checkbox, Slider } from "antd";
import CustomInput from "../../../components/CustomInput";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../../../constants/common";
import { queryPairs } from "../../../services/asset/query";
import { denomConversion } from "../../../utils/coin";
import { message } from "antd";

const marks = {
  0: "00:00hrs",
  100: "3d:00h:00m",
};

const FilterModal = ({ address, pairs, setPairs }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (!pairs?.list?.length) {
      fetchPairs(
        (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
        DEFAULT_PAGE_SIZE,
        true,
        false
      );
    }
  }, [address]);

  const fetchPairs = (offset, limit, countTotal, reverse) => {
    queryPairs(offset, 100, countTotal, reverse, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }

      setPairs(data.pairsInfo, data.pagination);
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        size="small"
        shape="round"
        className="filter-btn"
        onClick={showModal}
        style={{ border: "1px solid" }}
      >
        <SvgIcon name="filter" viewbox="0 0 13.579 13.385" /> Filter
      </Button>
      <Modal
        className="filter-modal"
        centered={true}
        closable={false}
        footer={null}
        visible={isModalVisible}
        width={500}
        onCancel={handleCancel}
        onOk={handleOk}
        title={false}
      >
        <div className="filter-head">
          Filters
          <SvgIcon name="filter" viewbox="0 0 13.579 13.385" />
        </div>
        <Form layout="vertical">
          <Row>
            <Col>
              <label>Auctioned Asset</label>
              <div className="filter-rows">
                <Checkbox key={1}>{denomConversion("uatom")}</Checkbox>
                <Checkbox key={2}>{denomConversion("uxprt")}</Checkbox>
                <Checkbox key={3}>{denomConversion("uakt")}</Checkbox>
                <Checkbox key={4}>{denomConversion("ucmdx")}</Checkbox>
                <Checkbox key={5}>{denomConversion("udvpn")}</Checkbox>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <label>Bidding Asset</label>
              <div className="filter-rows">
                <Checkbox key={1}>CMST</Checkbox>
                <Checkbox key={2}>HARBOR</Checkbox>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="timer-container">
                <label>Timer</label>
                <CustomInput
                  placeholder="0"
                  value={sliderValue}
                  onChange={(event) => {
                    setSliderValue(event.target?.value);
                  }}
                  defaultValue="1d:12h:1m"
                />
              </div>
              <div className="mt-2 filter-rows pb-4">
                <div className="slider-numbers">
                  <Slider
                    className="comdex-slider filter-slider"
                    marks={marks}
                    defaultValue={39}
                    max={100}
                    min={0}
                    value={sliderValue}
                    onChange={setSliderValue}
                    tooltipVisible={false}
                  />
                </div>
              </div>
            </Col>
          </Row>
          <Row className="text-center mt-3">
            <Col>
              <Button
                block
                type="primary"
                size="large"
                className="px-5"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button
                block
                type="primary"
                size="large"
                className="btn-filled px-5"
                onClick={handleOk}
              >
                Apply
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default FilterModal;
