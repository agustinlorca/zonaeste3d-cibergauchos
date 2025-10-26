import React from "react";
import Carousel from "react-bootstrap/Carousel";
import BannerZero from "../../Assets/img/banner-0.png";
import BannerOne from "../../Assets/img/banner-1.png";
import BannerTwo from "../../Assets/img/banner-2.png";

const Banner = () => {
  return (
    <Carousel>
      <Carousel.Item interval={1000}>
        <img className="d-block w-100" src={BannerZero} alt="First slide" />
      </Carousel.Item>
      <Carousel.Item interval={1000}>
        <img className="d-block w-100" src={BannerOne} alt="Second slide" />
      </Carousel.Item>
      <Carousel.Item>
        <img className="d-block w-100" src={BannerTwo} alt="Third slide" />

      </Carousel.Item>
    </Carousel>
  );
};

export default Banner;
