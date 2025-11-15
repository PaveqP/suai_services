export type DriverOrderType = {
  city: string;
  startTripStreet: string;
  startTripHouse: string;
  startTripBuild: string;
  destinationStreet: string;
  destinationHouse: string;
  destinationBuild: string;
  serviceCategory: string;
  status: string;
  price: string;
  driverName: string;
  car: CarModelType;
};

type CarModelType = {
  brand: string;
  model: string;
  number: string;
};
