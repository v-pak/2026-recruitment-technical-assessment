use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};

pub async fn process_data(Json(request): Json<DataRequest>) -> impl IntoResponse {
    // Calculate sums and return response

    let mut string_len = 0;
    let mut int_sum = 0;

    for val in request.data {
        match val {
            ReqVals::Word(string) => string_len += string.chars().count(),
            ReqVals::Num(num) => int_sum += num,
        }
    }

    let response = DataResponse {
        string_len,
        int_sum,
    };

    (StatusCode::OK, Json(response))
}

// Had to look up syntax for serde(untagged), the rest was without assistance
#[derive(Deserialize)]
#[serde(untagged)]
pub enum ReqVals {
    Word(String),
    Num(i32),
}

#[derive(Deserialize)]
pub struct DataRequest {
    data: Vec<ReqVals>,
}

#[derive(Serialize)]
pub struct DataResponse {
    string_len: usize,
    int_sum: i32,
}
