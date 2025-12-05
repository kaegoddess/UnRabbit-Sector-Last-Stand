
import React, { useState, useEffect } from 'react';

// FallbackImage 컴포넌트의 props 타입을 정의합니다.
// 'srcs'는 시도할 이미지 URL의 배열입니다.
// 나머지 props는 표준 <img> 태그가 받는 모든 속성을 포함합니다.
interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  srcs: string[];
}

/**
 * 여러 이미지 소스를 순서대로 로드 시도하는 이미지 컴포넌트입니다.
 * 첫 번째 소스(주로 Google Cloud URL) 로드에 실패하면 다음 소스(주로 로컬 경로)를 시도합니다.
 * @param {string[]} srcs - 로드할 이미지 URL 배열 (우선순위 순).
 * @param {object} ...rest - <img> 태그에 전달될 나머지 모든 props (className, alt, onLoad 등).
 */
const FallbackImage: React.FC<FallbackImageProps> = ({ srcs, onLoad, ...rest }) => {
  // 현재 시도하고 있는 'srcs' 배열의 인덱스를 저장하는 상태입니다.
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

  // 'srcs' prop이 변경될 때마다 시도 인덱스를 초기화합니다.
  useEffect(() => {
    setCurrentSrcIndex(0);
  }, [srcs]);

  // 이미지 로딩에 실패했을 때 호출되는 에러 핸들러입니다.
  const handleError = () => {
    // 다음 시도할 URL이 배열 안에 있는지 확인합니다.
    if (currentSrcIndex < srcs.length - 1) {
      // 다음 인덱스로 상태를 업데이트하여 다음 URL 로드를 트리거합니다.
      setCurrentSrcIndex(currentSrcIndex + 1);
    } else {
      // 모든 URL 시도에 실패한 경우, 콘솔에 경고 메시지를 출력합니다.
      console.warn(`모든 이미지 소스 로드 실패:`, srcs);
    }
  };

  // 현재 시도할 유효한 소스 URL이 있는지 확인합니다.
  const currentSrc = srcs && srcs.length > currentSrcIndex ? srcs[currentSrcIndex] : null;

  // 유효한 소스 URL이 없으면 아무것도 렌더링하지 않습니다.
  if (!currentSrc) {
    return null;
  }

  // <img> 태그를 렌더링합니다.
  // src에는 현재 시도 중인 URL을, onError와 onLoad에는 핸들러를 연결합니다.
  // [수정] 내부적인 opacity 제어 로직을 제거하고, 부모 컴포넌트로부터 받은 className을 그대로 적용합니다.
  return (
    <img
      src={currentSrc}
      onError={handleError}
      onLoad={onLoad} // 부모로부터 받은 onLoad 콜백을 직접 연결
      {...rest} // className, alt 등이 여기에 포함됨
    />
  );
};

export default FallbackImage;
